#!/usr/bin/env node

/**
 * Exam Schedule Cleanup Script (Multi-Room)
 *
 * - Fetch schedules per room
 * - Delete each schedule by ID
 * - Per-room + global summary
 */

const CONFIG = {
    baseUrl: "http://sijupri.sesasi.xyz:8000",
    bearerToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzaWp1cHJpLXdlYiIsImp0aSI6IjY3ZjFlZDYyNGQ1Zjg4Yjc1YjZkN2RiOWI1ZDk1OGEyMzdjYmEyYzQyZDE1ZmY5OTAwYTk2M2JiMGI0Nzc2OTcxNGQ3NTZmMTU5MGI1OWM0IiwiaWF0IjoxNzc1NzE4MDg2Ljc5MzI2LCJuYmYiOjE3NzU3MTgwODYuNzkzMjY1LCJleHAiOjE3Nzg3MTgwODYuNjYzOTU4LCJzdWIiOiIxMTExMTExMTExMTExMTExMTEiLCJzY29wZXMiOltdLCJkZXRhaWxzIjp7ImlkIjoiMTExMTExMTExMTExMTExMTExIiwibmFtZSI6IkdvbGRpYW4gUGFrcGFoYW4iLCJyb2xlX2NvZGVzIjpbIkFETUlOIl0sIm1lbnVfY29kZXMiOlsiTU5VX0FLUDAwMDEiLCJNTlVfQUtQMDAwMyIsIk1OVV9BS1AwMDAyIiwiTU5VX0FLUDAwMDQiLCJNTlVfQUtQMDAwNSIsIk1OVV9BS1AwMDA2IiwiTU5VX0ZPUjAwMDEiLCJNTlVfRk9SMDAwMiIsIk1OVV9GT1IwMDAzIiwiTU5VX0ZPUjAwMDQiLCJNTlVfRk9SMDAwNSIsIk1OVV9QQUswMDAxIiwiTU5VX1BBSzAwMDIiLCJNTlVfUEFLMDAwMyIsIk1OVV9VS00wMDAxIiwiTU5VX1VLTTAwMDIiLCJNTlVfVUtNMDAwMyIsIk1OVV9VS00wMDA0IiwiTU5VX1VLTTAwMDUiLCJNTlVfVUtNMDAwNiIsIk1OVV9VS00wMDA3IiwiTU5VX1VLTTAwMDgiLCJNTlVfVUtNMDAwOSIsIk1OVV9VS00wMDEwIiwiTU5VX1VLTTAwMTIiLCJNTlVfU0lQMDAwMSIsIk1OVV9TSVAwMDAyIiwiTU5VX1NJUDAwMDMiLCJNTlVfU0lQMDAwNCIsIk1OVV9TRUMwMDAxIiwiTU5VX1NFQzAwMDIiLCJNTlVfU0VDMDAwMyIsIk1OVV9NTlQwMDAxIiwiTU5VX01OVDAwMDIiLCJNTlVfTU5UMDAwMyIsIk1OVV9NTlQwMDA0IiwiTU5VX01OVDAwMDUiLCJNTlVfTU5UMDAwNiIsIk1OVV9NTlQwMDA3IiwiTU5VX01OVDAwMDgiLCJNTlVfUlBUMDAwMSIsIk1OVV9SUFQwMDAyIiwiTU5VX1JQVDAwMDMiLCJNTlVfUlBUMDAwNCIsIk1OVV9SUFQwMDA1Il0sImFwcGxpY2F0aW9uX2NvZGUiOiJzaWp1cHJpLWFkbWluIiwiaW5zdGFuc2lfaWQiOm51bGwsInVuaXRfa2VyamFfaWQiOm51bGwsInVybHMiOlsiL2FwaS92MS8qKnxDVUQiXX19.fg5k5Fh7QlTR_JBfqQVlWiY0dhvX4gYbKmwvNepPxs0-I1BPAJOL_VHQBvo7xI63oo-fOyUmlUpWaODfKr3enQFr9ALzHMOhZroh_oC3LE1wiNbWK8xLaDd69wKQ8ldyyFLAJAuPOcTOh7vVg4X5mn06zzN7AmHtEfQGjhkOWPrmdY6jd0T3CCl6JwQIZ_Sba7gAuM_VHVhirbncS_qq6Lf3bacIQGEz6FkLpkpX017vx79UnK8n29MC0uMFyjAGCvEMBmwqsjJYoR_BSzhz7HmDb57c5LE-KishAtzR9x54JQyAex1Do-KAZFScRtPp0j3FlYBbQyxGGNA_kwlyxF3_7uUhBTFegZQqBvSrm1hXz3RobsRK3XtZw2gnPq-jw6PJzOv0FzJmmljjTFB4ybP8hIWkRvbPn2LLJ_aGkIqeWm34kmL3av3ZDrfwitFpKjUewdxCleDG8Y0l8WIyGlOJAbaQtIlhelVt020mdeoUwztMRw1MLMTp0nRh-6kcBZWDHw82j3xP4pWWo2oQ5Z3PfwwOUr38llTy7f8IsvTfnO_wWDOxz9qupwLO4Y6irkbSXazfHugI52MqIqAbQm2m6EWy3eBsndKqLF8hkuxvsgkNFdDplD9mWc-HI3hzxQDVlTgtQhQ6k4wF6MNvL8mSvjL8Nt5vxMC2cMRMzbg",

    // ✅ multi-room
    roomUkomIds: [
        "49e222e9-0e93-45ab-a8b4-403fd7f860d3",
        "22c1a104-877f-4a22-9dd8-b76a5f04edf6",
        // add more room IDs here
    ],
}

// ============================================================================
// API
// ============================================================================

async function fetchAllSchedules(roomUkomId) {
    const url = `${CONFIG.baseUrl}/api/v1/exam_schedule/room/${roomUkomId}`

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CONFIG.bearerToken}`,
        },
    })

    if (!response.ok) {
        throw new Error(
            `Failed to fetch schedules for room ${roomUkomId}: ${response.status}`,
        )
    }

    return await response.json()
}

async function deleteSchedule(id) {
    const url = `${CONFIG.baseUrl}/api/v1/exam_schedule/${id}`

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CONFIG.bearerToken}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to delete schedule ${id}: ${response.status}`)
    }

    return await response.text()
}

// ============================================================================
// UTIL
// ============================================================================

function toLocalISOString(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0")

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())

    const offsetMinutes = -date.getTimezoneOffset()
    const sign = offsetMinutes >= 0 ? "+" : "-"
    const absOffset = Math.abs(offsetMinutes)
    const offsetHours = pad(Math.floor(absOffset / 60))
    const offsetMins = pad(absOffset % 60)

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log("Current Time:", toLocalISOString())
    console.log("Exam Schedule Cleanup Script")

    let totalSuccess = 0
    let totalFailed = 0

    for (const roomId of CONFIG.roomUkomIds) {
        console.log("\n" + "=".repeat(80))
        console.log(`ROOM: ${roomId}`)
        console.log("=".repeat(80))

        let schedules

        // 1. Fetch schedules
        try {
            console.log("Fetching schedules...")
            schedules = await fetchAllSchedules(roomId)
        } catch (err) {
            console.error(`Error fetching (${roomId}):`, err.message)
            totalFailed++
            continue
        }

        if (!Array.isArray(schedules) || schedules.length === 0) {
            console.log("No schedules found.")
            continue
        }

        let success = 0
        let failed = 0

        // 2. Delete schedules sequentially
        for (const schedule of schedules) {
            try {
                await deleteSchedule(schedule.id)
                console.log(`Deleted: ${schedule.id}`)
                success++
            } catch (err) {
                console.error(`Failed (${schedule.id}):`, err.message)
                failed++
            }
        }

        console.log(`Room Summary → Success: ${success}, Failed: ${failed}`)

        totalSuccess += success
        totalFailed += failed
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================

    console.log("\n" + "=".repeat(80))
    console.log("FINAL SUMMARY")
    console.log("=".repeat(80))
    console.log(`Total Success: ${totalSuccess}`)
    console.log(`Total Failed: ${totalFailed}`)

    process.exit(totalFailed > 0 ? 1 : 0)
}

main().catch((err) => {
    console.error("Fatal error:", err)
    process.exit(1)
})
