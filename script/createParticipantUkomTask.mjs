#!/usr/bin/env node

/**
 * Participant UKOM Task Seeder
 *
 * For each request, this script replaces every occurrence of the placeholder
 * 18-digit number inside the payload template with a new random 18-digit number.
 */
import "dotenv/config"

const CONFIG = {
    baseUrl: "http://sijupri.sesasi.xyz:8000",
    endpoint: "/api/v1/participant_ukom/task",

    // Optional. Fill if your API requires auth.
    bearerToken: process.env.BEARER_TOKEN,

    // Runs this many POST requests.
    requestCount: 2,

    // Delay between requests in milliseconds.
    delayMs: 5000,

    // Use --dry-run to print payload without sending request.
    dryRun: false,

    // All occurrences of this token in payloadTemplate will be replaced.
    dynamicToken: "183781606383047389",

    // If true, uses fixedDynamicValue instead of random value.
    useFixedDynamicValue: false,
    fixedDynamicValue: "183781606383047389",

    payloadTemplate: {
        bidangJabatanCode: null,
        dokumenUkomList: [
            {
                dokumenFile: "data:application/pdf;base64,",
                dokumenPersyaratanId: "fa3ad21e-3402-419a-ac73-d4caf088cd7e",
                dokumenPersyaratanName:
                    "Dokumen Syarat Ukom_213213213123213213_1776763060174_Dokumen Syarat Ukom",
            },
        ],
        email: "feisal@sesasi.id",
        isMengulang: false,
        jabatanName: "183781606383047389",
        jenisInstansi: "KEMENTERIAN_PERDAGANGAN",
        jenisUkom: "PERPINDAHAN_JABATAN",
        jenjangName: "183781606383047389",
        jurusan: "183781606383047389",
        kabupatenKotaId: "",
        name: "183781606383047389",
        nextJabatanCode: "JB10",
        nextJenjangCode: "JJ2",
        nip: "183781606383047389",
        noSuratUsulan: "183781606383047389",
        pangkatCode: "PK7",
        password: "password",
        pendidikanTerakhirCode: "PD1",
        phone: "354790473936",
        predikatKinerja1Id: "8288756f-1355-4f6e-9903-ce95cfc06ddb",
        predikatKinerja2Id: "8288756f-1355-4f6e-9903-ce95cfc06ddb",
        provinsiId: "",
        tanggalLahir: "2026-03-25",
        tempatLahir: "183781606383047389",
        tglSuratUsulan: "2026-03-25",
        tmtJabatan: "2026-03-25",
        tmtPangkat: "2026-03-17",
        unitKerjaName: "183781606383047389",
    },
}

function parseArgs(argv) {
    const args = {
        dryRun: false,
    }

    for (const arg of argv) {
        if (arg === "--dry-run") {
            args.dryRun = true
        }
    }

    return args
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function is18DigitNumber(value) {
    return /^\d{18}$/.test(value)
}

function generateRandom18Digit() {
    let result = String(Math.floor(Math.random() * 9) + 1)
    for (let i = 0; i < 17; i++) {
        result += String(Math.floor(Math.random() * 10))
    }
    return result
}

function replaceTokenDeep(value, token, replacement) {
    if (typeof value === "string") {
        return value.split(token).join(replacement)
    }

    if (Array.isArray(value)) {
        return value.map((item) => replaceTokenDeep(item, token, replacement))
    }

    if (value && typeof value === "object") {
        const out = {}
        for (const [key, val] of Object.entries(value)) {
            out[key] = replaceTokenDeep(val, token, replacement)
        }
        return out
    }

    return value
}

function buildSamplePdfDataUrl(dynamicValue) {
    // Very small valid-looking PDF content, encoded as data URL.
    const pdfContent = `%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 58 >>\nstream\nBT\n/F1 12 Tf\n20 50 Td\n(UKOM SAMPLE ${dynamicValue}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n9\n%%EOF`
    const base64 = Buffer.from(pdfContent, "utf8").toString("base64")
    return `data:application/pdf;base64,${base64}`
}

function fillDokumenFileList(payload, dataUrl) {
    if (!Array.isArray(payload.dokumenUkomList)) {
        return payload
    }

    payload.dokumenUkomList = payload.dokumenUkomList.map((item) => {
        const cloned = { ...item }
        if (
            !cloned.dokumenFile ||
            cloned.dokumenFile === "data:application/pdf;base64,"
        ) {
            cloned.dokumenFile = dataUrl
        }
        return cloned
    })

    return payload
}

function resolveDynamicValue() {
    if (CONFIG.useFixedDynamicValue) {
        if (!is18DigitNumber(CONFIG.fixedDynamicValue)) {
            throw new Error(
                "CONFIG.fixedDynamicValue must be exactly 18 digits",
            )
        }
        return CONFIG.fixedDynamicValue
    }

    return generateRandom18Digit()
}

function validateConfig() {
    if (!CONFIG.baseUrl || !CONFIG.endpoint) {
        throw new Error("CONFIG.baseUrl and CONFIG.endpoint are required")
    }

    if (!is18DigitNumber(CONFIG.dynamicToken)) {
        throw new Error("CONFIG.dynamicToken must be exactly 18 digits")
    }

    if (!Number.isInteger(CONFIG.requestCount) || CONFIG.requestCount <= 0) {
        throw new Error("CONFIG.requestCount must be a positive integer")
    }
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendPostRequest(payload) {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoint}`

    const headers = {
        "Content-Type": "application/json",
    }

    if (CONFIG.bearerToken) {
        headers.Authorization = `Bearer ${CONFIG.bearerToken}`
    }

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    let responseBody

    try {
        responseBody = JSON.parse(responseText)
    } catch {
        responseBody = responseText
    }

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${JSON.stringify(responseBody)}`,
        )
    }

    return {
        status: response.status,
        body: responseBody,
    }
}

function buildPayloadForRequest() {
    const dynamicValue = resolveDynamicValue()

    const replacedPayload = replaceTokenDeep(
        deepClone(CONFIG.payloadTemplate),
        CONFIG.dynamicToken,
        dynamicValue,
    )

    const samplePdfDataUrl = buildSamplePdfDataUrl(dynamicValue)
    const payload = fillDokumenFileList(replacedPayload, samplePdfDataUrl)

    return {
        payload,
        dynamicValue,
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    const dryRun = CONFIG.dryRun || args.dryRun

    validateConfig()

    console.log("Participant UKOM Task Seeder")
    console.log(`Target: ${CONFIG.baseUrl}${CONFIG.endpoint}`)
    console.log(`Requests: ${CONFIG.requestCount}`)
    console.log(`Dry run: ${dryRun}`)

    let success = 0
    let failed = 0

    for (let i = 0; i < CONFIG.requestCount; i++) {
        const { payload, dynamicValue } = buildPayloadForRequest()

        console.log("\n" + "-".repeat(80))
        console.log(`Request ${i + 1}/${CONFIG.requestCount}`)
        console.log(`Dynamic 18-digit value: ${dynamicValue}`)

        if (dryRun) {
            console.log(JSON.stringify(payload, null, 2))
            success++
        } else {
            try {
                const result = await sendPostRequest(payload)
                console.log(`Success (${result.status})`)
                success++
            } catch (err) {
                console.error("Request failed:", err.message)
                failed++
            }
        }

        if (i < CONFIG.requestCount - 1 && CONFIG.delayMs > 0) {
            await sleep(CONFIG.delayMs)
        }
    }

    console.log("\n" + "=".repeat(80))
    console.log(`Done. Success: ${success}, Failed: ${failed}`)

    process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
    console.error("Fatal error:", err.message)
    process.exit(1)
})
