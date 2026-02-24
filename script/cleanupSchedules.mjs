#!/usr/bin/env node

/**
 * Exam Schedule Cleanup Script
 *
 * Fetches all exam schedules for a room, then deletes each by ID.
 *
 * Usage: node cleanupSchedules.mjs
 */

const CONFIG = {
    baseUrl: "http://103.217.144.101:8000",
    bearerToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzaWp1cHJpLXdlYiIsImp0aSI6ImZkODM5YzU5NDZlYTZhYzQ5Nzg3OTljMDc2YWM4MDU2ZTRjZjExZmQ5NTViZDNkY2U1YjRiMGQ1NjExMTg0NjRiNDY4MGI5NmVhNGFhNWIzIiwiaWF0IjoxNzcwOTY1MjIzLjA3ODcyNCwibmJmIjoxNzcwOTY1MjIzLjA3ODczLCJleHAiOjE3NzM5NjUyMjIuOTA4MTc1LCJzdWIiOiIxMTExMTExMTExMTExMTExMTEiLCJzY29wZXMiOltdLCJkZXRhaWxzIjp7ImlkIjoiMTExMTExMTExMTExMTExMTExIiwibmFtZSI6IkdvbGRpYW4gUGFrcGFoYW4iLCJyb2xlX2NvZGVzIjpbIkFETUlOIl0sIm1lbnVfY29kZXMiOlsiTU5VX0FLUDAwMDEiLCJNTlVfQUtQMDAwMyIsIk1OVV9BS1AwMDAyIiwiTU5VX0FLUDAwMDQiLCJNTlVfQUtQMDAwNSIsIk1OVV9BS1AwMDA2IiwiTU5VX0ZPUjAwMDEiLCJNTlVfRk9SMDAwMiIsIk1OVV9GT1IwMDAzIiwiTU5VX0ZPUjAwMDQiLCJNTlVfRk9SMDAwNSIsIk1OVV9QQUswMDAxIiwiTU5VX1BBSzAwMDIiLCJNTlVfUEFLMDAwMyIsIk1OVV9VS00wMDAxIiwiTU5VX1VLTTAwMDIiLCJNTlVfVUtNMDAwMyIsIk1OVV9VS00wMDA0IiwiTU5VX1VLTTAwMDUiLCJNTlVfVUtNMDAwNiIsIk1OVV9VS00wMDA3IiwiTU5VX1VLTTAwMDgiLCJNTlVfVUtNMDAwOSIsIk1OVV9VS00wMDEwIiwiTU5VX1VLTTAwMTIiLCJNTlVfU0lQMDAwMSIsIk1OVV9TSVAwMDAyIiwiTU5VX1NJUDAwMDMiLCJNTlVfU0lQMDAwNCIsIk1OVV9TRUMwMDAxIiwiTU5VX1NFQzAwMDIiLCJNTlVfU0VDMDAwMyIsIk1OVV9NTlQwMDAxIiwiTU5VX01OVDAwMDIiLCJNTlVfTU5UMDAwMyIsIk1OVV9NTlQwMDA0IiwiTU5VX01OVDAwMDUiLCJNTlVfTU5UMDAwNiIsIk1OVV9NTlQwMDA3IiwiTU5VX01OVDAwMDgiLCJNTlVfUlBUMDAwMSIsIk1OVV9SUFQwMDAyIiwiTU5VX1JQVDAwMDMiLCJNTlVfUlBUMDAwNCIsIk1OVV9SUFQwMDA1Il0sImFwcGxpY2F0aW9uX2NvZGUiOiJzaWp1cHJpLWFkbWluIiwiaW5zdGFuc2lfaWQiOm51bGwsInVuaXRfa2VyamFfaWQiOm51bGwsInVybHMiOlsiL2FwaS92MS8qKnxDVUQiXX19.a3-ZVx3A8_3ro5L2RCpjOOSwAYXQjmWVy3JNBeq3mQXmD72IzIctFs52mDqu1GEyifnecDyRIR-kuDgyL0_dcWOGXQSKAvp39pMYHT8W8wovHL16u_5qevppkQrkJj7dmZWpOQ1fM4tjhCfc6y50NqW6NR2moeei1DknntFH-x4khtl_WaSOi4zL7XdKZUfAFm33JI2RjxENWQPn6eXXiFhdR6sX1iwd-O3XDCSYYy4Hmvr3BcQYA3IDGYd0xC06M24-HX2pBHbvKSdRb4cVW9iSe6gtqpksE1N4yDRv5hMpWif-kFXlk6hO4ftHQYtlViSpzO8Q6FtSqH3O8ARgXeb4J0MjM6xBKKisW0skL-ZFkPpjPWRHXFxckl0JIcZzesSwPyIY68ks7Eq1bub03K-qzR5HzObm67jTX8UveH_ukZDm9mkn7LMKeGmJsfS-1W1QmnsroxX3LhQd-zdu_mKgG9kR64In4FuVnhl9_niNmQ7P-dzifJNKJEV92VmkuRj5N8xTHHO7OEviHBA021ao6H7caCPSorjFPX5fG45ZqAUV5SvdmgehRoYY99qP80BoyOEPAkVUh_fEN67Y7ZcJIqmIpQIOSIT2AMZ-oMvAWZsCp8cJXT2dxfpnzhpFlTz6ZYZAu-aypeg2btuU85DZrQTXnvbz0gNDxVUFcZk",
    roomUkomId: "36dab9e9-74ae-4067-b120-e6c412c0998b",
}

async function fetchAllSchedules() {
    const url = `${CONFIG.baseUrl}/api/v1/exam_schedule/room/${CONFIG.roomUkomId}`
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CONFIG.bearerToken}`,
        },
    })
    if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`)
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

async function main() {
    console.log("Current Time: " + toLocalISOString())

    console.log("Exam Schedule Cleanup Script")
    console.log("Fetching all schedules...")
    let schedules
    try {
        schedules = await fetchAllSchedules()
    } catch (err) {
        console.error("Error fetching schedules:", err.message)
        process.exit(1)
    }
    if (!Array.isArray(schedules) || schedules.length === 0) {
        console.log("No schedules found.")
        process.exit(0)
    }
    let success = 0
    let failed = 0
    for (const schedule of schedules) {
        try {
            await deleteSchedule(schedule.id)
            console.log(`Deleted schedule: ${schedule.id}`)
            success++
        } catch (err) {
            console.error(
                `Failed to delete schedule ${schedule.id}:`,
                err.message,
            )
            failed++
        }
    }
    console.log("Cleanup complete.")
    console.log(`Success: ${success}, Failed: ${failed}`)
    process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
    console.error("Fatal error:", err)
    process.exit(1)
})
