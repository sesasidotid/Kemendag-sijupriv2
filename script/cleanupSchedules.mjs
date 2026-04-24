#!/usr/bin/env node

/**
 * Exam Schedule Cleanup Script (Multi-Room)
 *
 * - Fetch schedules per room
 * - Delete each schedule by ID
 * - Per-room + global summary
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
    // ✅ multi-room
    roomUkomIds: [
        "49e222e9-0e93-45ab-a8b4-403fd7f860d3",
        "22c1a104-877f-4a22-9dd8-b76a5f04edf6",
        "31dc93c9-4e54-46b4-b2b4-aadd0f054743",
        "6ed3c903-08ef-4639-96b0-8880716ec7bc",
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
