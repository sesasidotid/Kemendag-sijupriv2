#!/usr/bin/env node

import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
})

const CONFIG = {
    baseUrl: "http://sijupri.sesasi.xyz:8000",
    bearerToken: process.env.BEARER_TOKEN,

    baseStart: "2026-04-22T15:37",
    baseEnd: "2026-04-23T16:00",

    participantIds: [
        "67a69dd9-bffc-46d2-8a38-fb2eca0e86b5",
        "49e2bfb8-8db5-44c8-9454-c5ee5602d3fd",
        "c7c0c78a-0fa6-4af2-916c-dd77e115b84e",
        "c134438d-4c17-42dd-8cff-4d4a45e0aa38",
        "edfb2bef-4754-4bb2-a8be-d665fa954b50",
        "e1a29dac-6a4a-4da8-a037-d2991f3e6509",
        "7c359a99-45b8-425a-9632-868c55e2f091",
        "a7aa4a8f-2e9e-4993-8ee4-3c33278c8cdc",
        "0a6682fd-20b0-4ea2-b197-5534d10c0116",
        "caba5790-3ba7-4f69-9091-c9960844ec8a",
        "f74b223d-9d75-4896-83b1-1747aa45ae7b",
        "ab5bceab-1f5d-4512-92d8-67c9a5d1e342",
        "e23b2c7a-0430-4aaa-8065-2cf3c79512d2",
        "f83893d6-ab69-4943-9d7b-dddc7f52665d",
        "76bd86aa-c779-45b4-bbd3-cd4661ed6757",
        "c1fe9c1b-46f4-45cd-8fe0-87a6f1df24aa",
        "4123e286-229b-48f7-9eaf-029606d74817",
        "a192c9b9-3d8a-44ee-be95-3ffa6ed29b29",
        "eb042bd1-a80a-404b-b26c-054e29797dae",
        "af909cb7-7727-4baa-b21f-c9ddd24d5164",
        "b00e863e-c730-472e-8399-59252cc28986",
        "35a6b4c6-9cb3-4a77-adc7-900e7bcba224",
        "c8388ed0-d425-462c-babf-cc8e35854a78",
        "d15b5cfd-c6d0-4c82-89cd-ec55736fbba1",
        "6e7efa77-851f-47d6-a80b-49fb5b98a724",
        "5b118fec-dac3-4c5e-800b-fde22e4f3009",
        "d9ff0f5d-44bd-46e4-9768-bde42f3078da",
        "7e96613e-afb1-48d6-b67c-66be0ac0111b",
        "42c15812-f045-490e-9d32-223e2eaf01c6",
    ],
    participantLimit: 100,

    roomUkomIds: [
        "22c1a104-877f-4a22-9dd8-b76a5f04edf6",
        "49e222e9-0e93-45ab-a8b4-403fd7f860d3",
        "31dc93c9-4e54-46b4-b2b4-aadd0f054743",
    ],

    durationsMinutes: {
        cat: 5,
        wawancara: 1,
        praktik: 1,
        makalah: 1,
    },

    secretKeys: {
        cat: "1",
        studi_kasus: "1",
    },

    splitConfig: {
        cat: 1,
        wawancara: 1,
        portofolio: 1,
        praktik: 1,
        studi_kasus: 1,
        makalah: 1,
    },

    examinerAmount: {
        makalah: 1,
    },

    endpoints: {
        // cat: "/api/v1/exam_schedule/cat",
        // wawancara: "/api/v1/exam_schedule/wawancara",
        // portofolio: "/api/v1/exam_schedule/portofolio",
        // praktik: "/api/v1/exam_schedule/praktik",
        // studi_kasus: "/api/v1/exam_schedule/studi_kasus",
        makalah: "/api/v1/exam_schedule/makalah",
    },
}

// ============================================================================
// HELPERS
// ============================================================================

function getBaseStartTime() {
    const d = new Date(CONFIG.baseStart)
    if (isNaN(d.getTime())) throw new Error("Invalid baseStart")
    return d
}

function getBaseEndTime() {
    const d = new Date(CONFIG.baseEnd)
    if (isNaN(d.getTime())) throw new Error("Invalid baseEnd")
    return d
}

function formatDateTime(date) {
    const pad = (n) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function addMinutes(date, minutes) {
    const d = new Date(date)
    d.setMinutes(d.getMinutes() + minutes)
    return d
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function minutesToHours(minutes) {
    return minutes / 60
}

// ============================================================================
// 🔥 HYBRID SELECTION
// ============================================================================

function selectParticipants(list, { ids, limit }) {
    // 1. PRIORITY: ID-based selection
    if (ids && ids.length > 0) {
        const set = new Set(ids)
        return list.filter((id) => set.has(id))
    }

    // 2. FALLBACK: limit-based selection
    if (limit && limit > 0) {
        return list.slice(0, limit)
    }

    // 3. DEFAULT: all
    return list
}

// ============================================================================
// FETCH PARTICIPANTS
// ============================================================================

async function fetchParticipantIds(roomId) {
    const url = `${CONFIG.baseUrl}/api/v1/participant_ukom/room/${roomId}`

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${CONFIG.bearerToken}`,
        },
    })

    if (!res.ok) {
        throw new Error(`Failed fetch participants for room ${roomId}`)
    }

    const data = await res.json()
    return data.map((item) => item.participantUkom.id)
}

// ============================================================================
// SPLIT
// ============================================================================

function splitParticipants(list, count) {
    if (count <= 1) return [list]

    const size = Math.ceil(list.length / count)
    const result = []

    for (let i = 0; i < count; i++) {
        const chunk = list.slice(i * size, (i + 1) * size)
        if (chunk.length) result.push(chunk)
    }

    return result
}

// ============================================================================
// PAYLOAD TEMPLATES
// ============================================================================

const PAYLOAD_TEMPLATES = {
    cat: {
        roomUkomId: "",
        startTime: "",
        endTime: "",
        duration: "",
        secretKey: "",
        participantIdList: [],
    },
    wawancara: {
        roomUkomId: "",
        startTime: "",
        endTime: "",
        duration: "",
        participantIdList: [],
    },
    portofolio: {
        roomUkomId: "",
        startTime: "",
        endTime: "",
        participantIdList: [],
    },
    praktik: {
        roomUkomId: "",
        startTime: "",
        endTime: "",
        duration: "",
        participantIdList: [],
    },
    studi_kasus: {
        roomUkomId: "",
        startTime: "",
        endTime: "",
        secretKey: "",
        participantIdList: [],
    },
    makalah: {
        roomUkomId: "",
        makalahStartTime: "",
        makalahEndTime: "",
        seminarStartTime: "",
        seminarEndTime: "",
        duration: "",
        examinerAmount: 1,
        participantIdList: [],
    },
}

// ============================================================================
// BUILDERS (unchanged)
// ============================================================================

function buildStandardPayload(type, baseStart, baseEnd, participants, roomId) {
    const t = clone(PAYLOAD_TEMPLATES[type])
    const minutes = CONFIG.durationsMinutes[type]

    t.startTime = formatDateTime(baseStart)
    t.endTime = formatDateTime(baseEnd)
    t.roomUkomId = roomId
    t.participantIdList = participants
    t.duration = minutesToHours(minutes)

    if (["cat", "studi_kasus"].includes(type)) {
        t.secretKey = CONFIG.secretKeys[type]
    }

    return t
}

function buildWawancaraPayload(baseStart, baseEnd, participants, roomId) {
    const t = clone(PAYLOAD_TEMPLATES.wawancara)

    t.startTime = formatDateTime(baseStart)
    t.endTime = formatDateTime(baseEnd)
    t.roomUkomId = roomId
    t.participantIdList = participants
    t.duration = minutesToHours(CONFIG.durationsMinutes.wawancara)

    return t
}

function buildMakalahPayload(baseStart, baseEnd, participants, roomId) {
    const t = clone(PAYLOAD_TEMPLATES.makalah)

    const makalahStart = addMinutes(baseStart, -5)
    const makalahEnd = baseStart

    t.makalahStartTime = formatDateTime(makalahStart)
    t.makalahEndTime = formatDateTime(makalahEnd)
    t.seminarStartTime = formatDateTime(baseStart)
    t.seminarEndTime = formatDateTime(baseEnd)

    t.roomUkomId = roomId
    t.participantIdList = participants
    t.duration = minutesToHours(CONFIG.durationsMinutes.makalah)
    t.examinerAmount = CONFIG.examinerAmount.makalah

    return t
}

// ============================================================================
// HTTP (unchanged)
// ============================================================================

async function sendPost(endpoint, payload) {
    const url = `${CONFIG.baseUrl}${endpoint}`

    console.log("\n→", endpoint)
    console.log(JSON.stringify(payload, null, 2))

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CONFIG.bearerToken}`,
        },
        body: JSON.stringify(payload),
    })

    const text = await res.text()

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`)
    }

    console.log("✔ Success")
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    const baseStart = getBaseStartTime()
    const baseEnd = getBaseEndTime()

    for (const roomId of CONFIG.roomUkomIds) {
        console.log("\n" + "=".repeat(80))
        console.log(`ROOM: ${roomId}`)
        console.log("=".repeat(80))

        let participants = await fetchParticipantIds(roomId)
        console.log(`Participants (raw): ${participants.length}`)

        // 🔥 HYBRID APPLY
        participants = selectParticipants(participants, {
            ids: CONFIG.participantIds,
            limit: CONFIG.participantLimit,
        })

        console.log(`Participants (used): ${participants.length}`)

        for (const type of Object.keys(CONFIG.endpoints)) {
            const splitCount = CONFIG.splitConfig[type] || 1
            const groups = splitParticipants(participants, splitCount)

            console.log(
                `\n--- ${type.toUpperCase()} (split: ${splitCount}) ---`,
            )

            for (const group of groups) {
                try {
                    let payload

                    if (type === "wawancara") {
                        payload = buildWawancaraPayload(
                            baseStart,
                            baseEnd,
                            group,
                            roomId,
                        )
                    } else if (type === "makalah") {
                        payload = buildMakalahPayload(
                            baseStart,
                            baseEnd,
                            group,
                            roomId,
                        )
                    } else {
                        payload = buildStandardPayload(
                            type,
                            baseStart,
                            baseEnd,
                            group,
                            roomId,
                        )
                    }

                    await sendPost(CONFIG.endpoints[type], payload)
                } catch (err) {
                    console.error(`Error (${roomId} - ${type}):`, err.message)
                }
            }
        }
    }
}

main().catch((e) => {
    console.error("Fatal:", e)
    process.exit(1)
})
