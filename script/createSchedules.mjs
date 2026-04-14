#!/usr/bin/env node

/**
 * Exam Schedule Automation Script
 * - Multi-room
 * - Configurable split
 * - Fixed time window (baseStart → baseEnd)
 */
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

    baseStart: "2026-04-14T09:30",
    baseEnd: "2026-04-17T12:00", // ✅ NEW

    roomUkomIds: [
        "49e222e9-0e93-45ab-a8b4-403fd7f860d3",
        "22c1a104-877f-4a22-9dd8-b76a5f04edf6",
    ],

    durationsMinutes: {
        cat: 10,
        wawancara: 5,
        portofolio: 5,
        praktik: 5,
        studi_kasus: 5,
        makalah: {
            makalah: 5,
            seminar: 5,
        },
    },

    secretKeys: {
        cat: "1",
        studi_kasus: "1",
    },

    splitConfig: {
        cat: 1,
        wawancara: 2,
        portofolio: 2,
        praktik: 2,
        studi_kasus: 2,
        makalah: 2,
    },

    examinerAmount: {
        makalah: 2,
    },

    endpoints: {
        cat: "/api/v1/exam_schedule/cat",
        // wawancara: "/api/v1/exam_schedule/wawancara",
        // portofolio: "/api/v1/exam_schedule/portofolio",
        // praktik: "/api/v1/exam_schedule/praktik",
        // studi_kasus: "/api/v1/exam_schedule/studi_kasus",
        // makalah: "/api/v1/exam_schedule/makalah",
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
// BUILDERS
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

    const base = CONFIG.durationsMinutes.wawancara

    t.startTime = formatDateTime(baseStart)
    t.endTime = formatDateTime(baseEnd)
    t.roomUkomId = roomId
    t.participantIdList = participants
    t.duration = minutesToHours(base)

    return t
}

function buildMakalahPayload(baseStart, baseEnd, participants, roomId) {
    const t = clone(PAYLOAD_TEMPLATES.makalah)

    // 🔥 Special timeline
    const makalahStart = addMinutes(baseStart, -10)
    const makalahEnd = baseStart

    const seminarStart = baseStart
    const seminarEnd = baseEnd

    t.makalahStartTime = formatDateTime(makalahStart)
    t.makalahEndTime = formatDateTime(makalahEnd)
    t.seminarStartTime = formatDateTime(seminarStart)
    t.seminarEndTime = formatDateTime(seminarEnd)

    t.roomUkomId = roomId
    t.participantIdList = participants
    t.duration = minutesToHours(CONFIG.durationsMinutes.makalah.makalah)
    t.examinerAmount = CONFIG.examinerAmount.makalah

    return t
}

// ============================================================================
// HTTP
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

        const participants = await fetchParticipantIds(roomId)
        console.log(`Participants: ${participants.length}`)

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
