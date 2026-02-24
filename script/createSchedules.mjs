#!/usr/bin/env node

/**
 * Exam Schedule Automation Script
 * Minute-accurate internal scheduling.
 * Backend expects duration in HOURS → we convert at payload level.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    baseUrl: "http://103.217.144.101:8000",

    bearerToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzaWp1cHJpLXdlYiIsImp0aSI6ImZkODM5YzU5NDZlYTZhYzQ5Nzg3OTljMDc2YWM4MDU2ZTRjZjExZmQ5NTViZDNkY2U1YjRiMGQ1NjExMTg0NjRiNDY4MGI5NmVhNGFhNWIzIiwiaWF0IjoxNzcwOTY1MjIzLjA3ODcyNCwibmJmIjoxNzcwOTY1MjIzLjA3ODczLCJleHAiOjE3NzM5NjUyMjIuOTA4MTc1LCJzdWIiOiIxMTExMTExMTExMTExMTExMTEiLCJzY29wZXMiOltdLCJkZXRhaWxzIjp7ImlkIjoiMTExMTExMTExMTExMTExMTExIiwibmFtZSI6IkdvbGRpYW4gUGFrcGFoYW4iLCJyb2xlX2NvZGVzIjpbIkFETUlOIl0sIm1lbnVfY29kZXMiOlsiTU5VX0FLUDAwMDEiLCJNTlVfQUtQMDAwMyIsIk1OVV9BS1AwMDAyIiwiTU5VX0FLUDAwMDQiLCJNTlVfQUtQMDAwNSIsIk1OVV9BS1AwMDA2IiwiTU5VX0ZPUjAwMDEiLCJNTlVfRk9SMDAwMiIsIk1OVV9GT1IwMDAzIiwiTU5VX0ZPUjAwMDQiLCJNTlVfRk9SMDAwNSIsIk1OVV9QQUswMDAxIiwiTU5VX1BBSzAwMDIiLCJNTlVfUEFLMDAwMyIsIk1OVV9VS00wMDAxIiwiTU5VX1VLTTAwMDIiLCJNTlVfVUtNMDAwMyIsIk1OVV9VS00wMDA0IiwiTU5VX1VLTTAwMDUiLCJNTlVfVUtNMDAwNiIsIk1OVV9VS00wMDA3IiwiTU5VX1VLTTAwMDgiLCJNTlVfVUtNMDAwOSIsIk1OVV9VS00wMDEwIiwiTU5VX1VLTTAwMTIiLCJNTlVfU0lQMDAwMSIsIk1OVV9TSVAwMDAyIiwiTU5VX1NJUDAwMDMiLCJNTlVfU0lQMDAwNCIsIk1OVV9TRUMwMDAxIiwiTU5VX1NFQzAwMDIiLCJNTlVfU0VDMDAwMyIsIk1OVV9NTlQwMDAxIiwiTU5VX01OVDAwMDIiLCJNTlVfTU5UMDAwMyIsIk1OVV9NTlQwMDA0IiwiTU5VX01OVDAwMDUiLCJNTlVfTU5UMDAwNiIsIk1OVV9NTlQwMDA3IiwiTU5VX01OVDAwMDgiLCJNTlVfUlBUMDAwMSIsIk1OVV9SUFQwMDAyIiwiTU5VX1JQVDAwMDMiLCJNTlVfUlBUMDAwNCIsIk1OVV9SUFQwMDA1Il0sImFwcGxpY2F0aW9uX2NvZGUiOiJzaWp1cHJpLWFkbWluIiwiaW5zdGFuc2lfaWQiOm51bGwsInVuaXRfa2VyamFfaWQiOm51bGwsInVybHMiOlsiL2FwaS92MS8qKnxDVUQiXX19.a3-ZVx3A8_3ro5L2RCpjOOSwAYXQjmWVy3JNBeq3mQXmD72IzIctFs52mDqu1GEyifnecDyRIR-kuDgyL0_dcWOGXQSKAvp39pMYHT8W8wovHL16u_5qevppkQrkJj7dmZWpOQ1fM4tjhCfc6y50NqW6NR2moeei1DknntFH-x4khtl_WaSOi4zL7XdKZUfAFm33JI2RjxENWQPn6eXXiFhdR6sX1iwd-O3XDCSYYy4Hmvr3BcQYA3IDGYd0xC06M24-HX2pBHbvKSdRb4cVW9iSe6gtqpksE1N4yDRv5hMpWif-kFXlk6hO4ftHQYtlViSpzO8Q6FtSqH3O8ARgXeb4J0MjM6xBKKisW0skL-ZFkPpjPWRHXFxckl0JIcZzesSwPyIY68ks7Eq1bub03K-qzR5HzObm67jTX8UveH_ukZDm9mkn7LMKeGmJsfS-1W1QmnsroxX3LhQd-zdu_mKgG9kR64In4FuVnhl9_niNmQ7P-dzifJNKJEV92VmkuRj5N8xTHHO7OEviHBA021ao6H7caCPSorjFPX5fG45ZqAUV5SvdmgehRoYY99qP80BoyOEPAkVUh_fEN67Y7ZcJIqmIpQIOSIT2AMZ-oMvAWZsCp8cJXT2dxfpnzhpFlTz6ZYZAu-aypeg2btuU85DZrQTXnvbz0gNDxVUFcZk",
    baseStart: "2026-02-24T14:41",

    roomUkomId: "36dab9e9-74ae-4067-b120-e6c412c0998b",

    participantIdList: [],

    // SOURCE OF TRUTH = MINUTES
    durationsMinutes: {
        cat: 5,
        wawancara: 2,
        portofolio: 5,
        praktik: 5,
        studi_kasus: 5,
        makalah: {
            makalah: 2,
            seminar: 6,
        },
    },

    secretKeys: {
        cat: "1",
        studi_kasus: "1",
    },
}

// ============================================================================
// HELPERS
// ============================================================================

function getBaseStartTime() {
    const date = new Date(CONFIG.baseStart)
    if (isNaN(date.getTime())) {
        throw new Error(
            `Invalid CONFIG.baseStart format. Expected YYYY-MM-DDTHH:mm`,
        )
    }
    return date
}

function formatDateTime(date) {
    const pad = (n) => String(n).padStart(2, "0")

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function addMinutes(date, minutes) {
    const newDate = new Date(date)
    newDate.setMinutes(newDate.getMinutes() + minutes)
    return newDate
}

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function minutesToHours(minutes) {
    return minutes / 60 // no rounding
}

// ============================================================================
// PAYLOAD TEMPLATES
// ============================================================================

const PAYLOAD_TEMPLATES = {
    cat: {
        duration: 0,
        endTime: "",
        participantIdList: [],
        roomUkomId: "",
        secretKey: "1",
        startTime: "",
    },
    wawancara: {
        duration: 0,
        endTime: "",
        participantIdList: [],
        roomUkomId: "",
        startTime: "",
    },
    portofolio: {
        duration: 0,
        endTime: "",
        participantIdList: [],
        roomUkomId: "",
        secretKey: null,
        startTime: "",
    },
    praktik: {
        duration: 0,
        endTime: "",
        participantIdList: [],
        roomUkomId: "",
        secretKey: null,
        startTime: "",
    },
    studi_kasus: {
        duration: 0,
        endTime: "",
        participantIdList: [],
        roomUkomId: "",
        secretKey: "1",
        startTime: "",
    },
    makalah: {
        duration: 0,
        makalahStartTime: "",
        makalahEndTime: "",
        seminarStartTime: "",
        seminarEndTime: "",
        participantIdList: [],
        roomUkomId: "",
    },
}

// ============================================================================
// PAYLOAD BUILDERS
// ============================================================================

function buildStandardPayload(examType, baseStart) {
    const template = cloneObject(PAYLOAD_TEMPLATES[examType])
    const durationMinutes = CONFIG.durationsMinutes[examType]

    const startTime = baseStart
    const endTime = addMinutes(startTime, durationMinutes)

    template.startTime = formatDateTime(startTime)
    template.endTime = formatDateTime(endTime)
    template.roomUkomId = CONFIG.roomUkomId
    template.participantIdList = CONFIG.participantIdList

    // Backend expects HOURS
    template.duration = minutesToHours(durationMinutes)

    if (examType in CONFIG.secretKeys) {
        template.secretKey = CONFIG.secretKeys[examType]
    }

    return template
}

function buildWawancaraPayload(baseStart) {
    const template = cloneObject(PAYLOAD_TEMPLATES.wawancara)
    const durationMinutes = CONFIG.durationsMinutes.wawancara

    // multiplied by 5 (business rule)
    const totalMinutes = durationMinutes * 5

    const startTime = baseStart
    const endTime = addMinutes(startTime, totalMinutes)

    template.startTime = formatDateTime(startTime)
    template.endTime = formatDateTime(endTime)
    template.roomUkomId = CONFIG.roomUkomId
    template.participantIdList = CONFIG.participantIdList

    // duration field remains single-slot duration (as before)
    template.duration = minutesToHours(durationMinutes)

    return template
}

function buildMakalahPayload(baseStart) {
    const template = cloneObject(PAYLOAD_TEMPLATES.makalah)

    const makalahMinutes = CONFIG.durationsMinutes.makalah.makalah
    const seminarMinutes = CONFIG.durationsMinutes.makalah.seminar

    const makalahStartTime = baseStart
    const makalahEndTime = addMinutes(makalahStartTime, makalahMinutes)

    const seminarStartTime = makalahEndTime
    const seminarEndTime = addMinutes(seminarStartTime, seminarMinutes)

    template.makalahStartTime = formatDateTime(makalahStartTime)
    template.makalahEndTime = formatDateTime(makalahEndTime)
    template.seminarStartTime = formatDateTime(seminarStartTime)
    template.seminarEndTime = formatDateTime(seminarEndTime)

    template.roomUkomId = CONFIG.roomUkomId
    template.participantIdList = CONFIG.participantIdList

    // duration = makalah duration in HOURS (backend contract)
    template.duration = minutesToHours(makalahMinutes)

    return template
}

// ============================================================================
// HTTP
// ============================================================================

async function sendPostRequest(endpoint, payload) {
    const url = `${CONFIG.baseUrl}${endpoint}`

    console.log("\n" + "=".repeat(80))
    console.log(`Sending request to: ${endpoint}`)
    console.log("=".repeat(80))
    console.log(JSON.stringify(payload, null, 2))

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CONFIG.bearerToken}`,
        },
        body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    let responseData

    try {
        responseData = JSON.parse(responseText)
    } catch {
        responseData = responseText
    }

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${JSON.stringify(responseData)}`,
        )
    }

    console.log(`Success (${response.status})`)
    return responseData
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log("Exam Schedule Automation Script")
    console.log("=".repeat(80))

    const baseStart = getBaseStartTime()
    console.log(`Base start time: ${formatDateTime(baseStart)}`)

    const schedules = [
        {
            name: "cat",
            endpoint: "/api/v1/exam_schedule/cat",
            buildPayload: () => buildStandardPayload("cat", baseStart),
        },
        {
            name: "portofolio",
            endpoint: "/api/v1/exam_schedule/portofolio",
            buildPayload: () => buildStandardPayload("portofolio", baseStart),
        },
        // {
        //     name: "praktik",
        //     endpoint: "/api/v1/exam_schedule/praktik",
        //     buildPayload: () => buildStandardPayload("praktik", baseStart),
        // },
        // {
        //     name: "studi_kasus",
        //     endpoint: "/api/v1/exam_schedule/studi_kasus",
        //     buildPayload: () => buildStandardPayload("studi_kasus", baseStart),
        // },
        // {
        //     name: "wawancara",
        //     endpoint: "/api/v1/exam_schedule/wawancara",
        //     buildPayload: () => buildWawancaraPayload(baseStart),
        // },
        {
            name: "makalah",
            endpoint: "/api/v1/exam_schedule/makalah",
            buildPayload: () => buildMakalahPayload(baseStart),
        },
    ]

    let success = 0
    let failed = 0

    for (const schedule of schedules) {
        try {
            const payload = schedule.buildPayload()
            await sendPostRequest(schedule.endpoint, payload)
            success++
        } catch (err) {
            console.error(`Error in ${schedule.name}:`, err.message)
            failed++
        }
    }

    console.log("\n" + "=".repeat(80))
    console.log("SUMMARY")
    console.log("=".repeat(80))
    console.log(`Success: ${success}`)
    console.log(`Failed: ${failed}`)

    process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
    console.error("Fatal error:", err)
    process.exit(1)
})
