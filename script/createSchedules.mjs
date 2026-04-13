#!/usr/bin/env node

/**
 * Exam Schedule Automation Script
 * - Multi-room
 * - Configurable split
 * - Fixed time window (baseStart → baseEnd)
 */

const CONFIG = {
    baseUrl: "http://sijupri.sesasi.xyz:8000",
    bearerToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzaWp1cHJpLXdlYiIsImp0aSI6IjY3ZjFlZDYyNGQ1Zjg4Yjc1YjZkN2RiOWI1ZDk1OGEyMzdjYmEyYzQyZDE1ZmY5OTAwYTk2M2JiMGI0Nzc2OTcxNGQ3NTZmMTU5MGI1OWM0IiwiaWF0IjoxNzc1NzE4MDg2Ljc5MzI2LCJuYmYiOjE3NzU3MTgwODYuNzkzMjY1LCJleHAiOjE3Nzg3MTgwODYuNjYzOTU4LCJzdWIiOiIxMTExMTExMTExMTExMTExMTEiLCJzY29wZXMiOltdLCJkZXRhaWxzIjp7ImlkIjoiMTExMTExMTExMTExMTExMTExIiwibmFtZSI6IkdvbGRpYW4gUGFrcGFoYW4iLCJyb2xlX2NvZGVzIjpbIkFETUlOIl0sIm1lbnVfY29kZXMiOlsiTU5VX0FLUDAwMDEiLCJNTlVfQUtQMDAwMyIsIk1OVV9BS1AwMDAyIiwiTU5VX0FLUDAwMDQiLCJNTlVfQUtQMDAwNSIsIk1OVV9BS1AwMDA2IiwiTU5VX0ZPUjAwMDEiLCJNTlVfRk9SMDAwMiIsIk1OVV9GT1IwMDAzIiwiTU5VX0ZPUjAwMDQiLCJNTlVfRk9SMDAwNSIsIk1OVV9QQUswMDAxIiwiTU5VX1BBSzAwMDIiLCJNTlVfUEFLMDAwMyIsIk1OVV9VS00wMDAxIiwiTU5VX1VLTTAwMDIiLCJNTlVfVUtNMDAwMyIsIk1OVV9VS00wMDA0IiwiTU5VX1VLTTAwMDUiLCJNTlVfVUtNMDAwNiIsIk1OVV9VS00wMDA3IiwiTU5VX1VLTTAwMDgiLCJNTlVfVUtNMDAwOSIsIk1OVV9VS00wMDEwIiwiTU5VX1VLTTAwMTIiLCJNTlVfU0lQMDAwMSIsIk1OVV9TSVAwMDAyIiwiTU5VX1NJUDAwMDMiLCJNTlVfU0lQMDAwNCIsIk1OVV9TRUMwMDAxIiwiTU5VX1NFQzAwMDIiLCJNTlVfU0VDMDAwMyIsIk1OVV9NTlQwMDAxIiwiTU5VX01OVDAwMDIiLCJNTlVfTU5UMDAwMyIsIk1OVV9NTlQwMDA0IiwiTU5VX01OVDAwMDUiLCJNTlVfTU5UMDAwNiIsIk1OVV9NTlQwMDA3IiwiTU5VX01OVDAwMDgiLCJNTlVfUlBUMDAwMSIsIk1OVV9SUFQwMDAyIiwiTU5VX1JQVDAwMDMiLCJNTlVfUlBUMDAwNCIsIk1OVV9SUFQwMDA1Il0sImFwcGxpY2F0aW9uX2NvZGUiOiJzaWp1cHJpLWFkbWluIiwiaW5zdGFuc2lfaWQiOm51bGwsInVuaXRfa2VyamFfaWQiOm51bGwsInVybHMiOlsiL2FwaS92MS8qKnxDVUQiXX19.fg5k5Fh7QlTR_JBfqQVlWiY0dhvX4gYbKmwvNepPxs0-I1BPAJOL_VHQBvo7xI63oo-fOyUmlUpWaODfKr3enQFr9ALzHMOhZroh_oC3LE1wiNbWK8xLaDd69wKQ8ldyyFLAJAuPOcTOh7vVg4X5mn06zzN7AmHtEfQGjhkOWPrmdY6jd0T3CCl6JwQIZ_Sba7gAuM_VHVhirbncS_qq6Lf3bacIQGEz6FkLpkpX017vx79UnK8n29MC0uMFyjAGCvEMBmwqsjJYoR_BSzhz7HmDb57c5LE-KishAtzR9x54JQyAex1Do-KAZFScRtPp0j3FlYBbQyxGGNA_kwlyxF3_7uUhBTFegZQqBvSrm1hXz3RobsRK3XtZw2gnPq-jw6PJzOv0FzJmmljjTFB4ybP8hIWkRvbPn2LLJ_aGkIqeWm34kmL3av3ZDrfwitFpKjUewdxCleDG8Y0l8WIyGlOJAbaQtIlhelVt020mdeoUwztMRw1MLMTp0nRh-6kcBZWDHw82j3xP4pWWo2oQ5Z3PfwwOUr38llTy7f8IsvTfnO_wWDOxz9qupwLO4Y6irkbSXazfHugI52MqIqAbQm2m6EWy3eBsndKqLF8hkuxvsgkNFdDplD9mWc-HI3hzxQDVlTgtQhQ6k4wF6MNvL8mSvjL8Nt5vxMC2cMRMzbg",

    baseStart: "2026-04-13T1030:00",
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

function buildMakalahPayload(
    baseStart,
    baseEnd,
    participants,
    splitCount,
    roomId,
) {
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
    t.examinerAmount = splitCount

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

    // const endpoints = {
    //     cat: "/api/v1/exam_schedule/cat",
    //     wawancara: "/api/v1/exam_schedule/wawancara",
    //     portofolio: "/api/v1/exam_schedule/portofolio",
    //     praktik: "/api/v1/exam_schedule/praktik",
    //     studi_kasus: "/api/v1/exam_schedule/studi_kasus",
    //     makalah: "/api/v1/exam_schedule/makalah",
    // }

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
                            splitCount,
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
