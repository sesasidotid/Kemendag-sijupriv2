import { Injectable } from '@angular/core'
import { SystemConfigService } from '../../base/services/system-config.service'
import {
    MainSchedule,
    ParticipantSchedule,
    ScheduleSlot,
} from '../models/schedule-slot.model'

/**
 * Schedule Slot Service
 * Handles slot generation, validation, and availability logic
 * Timezone: All dates treated as UTC+7 (Asia/Jakarta) - no conversion from browser timezone
 *
 * IMPORTANT: All Date objects are interpreted as UTC+7 times.
 * - API sends times in UTC+7 format
 * - User sees times in UTC+7 format
 * - User selections are sent as UTC+7 times
 * - No browser timezone conversion occurs
 */
@Injectable({
    providedIn: 'root',
})
export class ScheduleSlotService {
    private UNAVAILABLE_START_HOUR = 17 // 17:00 UTC+7
    private UNAVAILABLE_END_HOUR = 8 // 08:00 UTC+7
    private MIDDAY_UNAVAILABLE_START_HOUR = 12 // 12:00
    private MIDDAY_UNAVAILABLE_END_HOUR = 13 // 13:00

    /** Feature toggle */
    private disableUnavailableHours = false
    private disableWeekend = true

    constructor(private systemConfigService: SystemConfigService) {
        this.loadConfig()
    }

    /**
     * Parse date string as UTC+7 time (no timezone conversion)
     * Input: '2025-01-15T08:00:00' or '2025-01-15 08:00:00' -> Date with UTC time 08:00 (treated as UTC+7)
     */
    parseAsUTC7(dateString: string | Date): Date {
        if (dateString instanceof Date) {
            return dateString
        }
        // Replace space with 'T' to normalize format (API may send "2026-02-24 09:50:02")
        let cleanString = dateString.replace(' ', 'T')
        // Remove timezone suffix if present and append 'Z' to parse as UTC
        cleanString = cleanString.replace(/[+-]\d{2}:\d{2}$/, '') + 'Z'
        return new Date(cleanString)
    }

    /**
     * Generate all possible time slots within main schedule
     * Skips unavailable periods (12:00-13:00 lunch, 17:00-08:00 night, weekends) and resumes slots after breaks
     * Example: If exam starts 09:33 with 2h duration:
     *   - Slot 0: 09:33-11:33 ✅
     *   - 11:33-13:33 would overlap lunch, skip to 13:00
     *   - Slot 1: 13:00-15:00 ✅
     *   - Slot 2: 15:00-17:00 ✅
     */
    generateAllSlots(mainSchedule: MainSchedule): ScheduleSlot[] {
        const slots: ScheduleSlot[] = []
        // const durationMs = mainSchedule.duration * 60 * 60 * 1000
        const durationMinutes = Math.round(mainSchedule.duration * 60)
        const durationMs = durationMinutes * 60 * 1000

        let currentSlotStart = new Date(mainSchedule.startTime)
        let slotIndex = 0

        while (currentSlotStart < mainSchedule.endTime) {
            const currentSlotEnd = new Date(
                currentSlotStart.getTime() + durationMs,
            )

            // Stop if slot end exceeds main schedule end
            if (currentSlotEnd > mainSchedule.endTime) {
                break
            }

            // Check if slot falls on weekend
            // if (this.isWeekend(currentSlotStart)) {
            //     // Skip to next Monday 08:00
            //     const nextAvailableTime = this.getNextWeekday(currentSlotStart)
            //     currentSlotStart = nextAvailableTime
            //     continue
            // }
            if (!this.disableWeekend && this.isWeekend(currentSlotStart)) {
                const nextAvailableTime = this.getNextWeekday(currentSlotStart)
                currentSlotStart = nextAvailableTime
                continue
            }

            const isUnavailable = this.isSlotInUnavailableHours(
                currentSlotStart,
                currentSlotEnd,
            )

            // If slot is unavailable, skip it and jump to after the break
            if (isUnavailable) {
                const nextAvailableTime =
                    this.getNextAvailableTimeAfterBreak(currentSlotStart)

                // If we jumped to a new time, restart from there
                if (nextAvailableTime > currentSlotStart) {
                    currentSlotStart = nextAvailableTime
                    continue // Re-evaluate with new start time
                } else {
                    // No valid jump found, just move to next slot end
                    currentSlotStart = new Date(currentSlotEnd)
                    continue
                }
            }

            const occupiedParticipant = this.findParticipantInSlot(
                currentSlotStart,
                mainSchedule.participantScheduleList,
            )

            slots.push({
                slotIndex: slotIndex,
                startTime: new Date(currentSlotStart),
                endTime: new Date(currentSlotEnd),
                isOccupied: !!occupiedParticipant,
                isUnavailable: false, // We skip unavailable slots now
                participantSchedule: occupiedParticipant || undefined,
            })

            slotIndex++
            currentSlotStart = new Date(currentSlotEnd)
        }

        return slots
    }

    /**
     * Get available slots for rescheduling
     * Excludes occupied and unavailable slots
     */
    getAvailableSlots(allSlots: ScheduleSlot[]): ScheduleSlot[] {
        return allSlots.filter(
            (slot) => !slot.isOccupied && !slot.isUnavailable,
        )
    }

    /**
     * Validate if a reschedule request is valid
     */
    validateReschedule(
        newSlotTime: Date,
        mainSchedule: MainSchedule,
        excludeParticipantId?: string,
    ): { valid: boolean; reason?: string } {
        // Check if time is within main schedule
        if (
            newSlotTime < mainSchedule.startTime ||
            newSlotTime >= mainSchedule.endTime
        ) {
            return {
                valid: false,
                reason: 'Waktu di luar jadwal utama',
            }
        }

        // Check if on weekend
        if (this.isWeekend(newSlotTime)) {
            return {
                valid: false,
                reason: 'Akhir pekan (Sabtu & Minggu) tidak tersedia',
            }
        }

        // Check unavailable hours
        const slotEndTime = new Date(
            newSlotTime.getTime() + mainSchedule.duration * 60 * 60 * 1000,
        )
        if (this.isSlotInUnavailableHours(newSlotTime, slotEndTime)) {
            return {
                valid: false,
                reason: 'Slot berada di jam tidak tersedia (17:00-08:00 atau 12:00-13:00)',
            }
        }

        // Check overlap with other participants
        const overlappingParticipant =
            mainSchedule.participantScheduleList.find((p) => {
                if (
                    excludeParticipantId &&
                    p.participantId === excludeParticipantId
                ) {
                    return false // Skip the participant being rescheduled
                }
                if (!p.personalSchedule) return false
                const existingTime = new Date(p.personalSchedule)
                return existingTime.getTime() === newSlotTime.getTime()
            })

        if (overlappingParticipant) {
            return {
                valid: false,
                reason: `Slot sudah ditempati oleh ${overlappingParticipant.participantName}`,
            }
        }

        return { valid: true }
    }

    /**
     * Format date to readable time string (displayed as UTC+7 / WIB)
     * No conversion - shows the time as-is
     */
    formatTimeSlot(date: Date): string {
        const hours = date.getUTCHours().toString().padStart(2, '0')
        const minutes = date.getUTCMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes} WIB`
    }

    /**
     * Format date to full datetime string (displayed as UTC+7 / WIB)
     * No conversion - shows the time as-is
     */
    formatDateTime(date: Date): string {
        const year = date.getUTCFullYear()
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
        const day = date.getUTCDate().toString().padStart(2, '0')
        const hours = date.getUTCHours().toString().padStart(2, '0')
        const minutes = date.getUTCMinutes().toString().padStart(2, '0')
        return `${day}/${month}/${year} ${hours}:${minutes} WIB`
    }

    private loadConfig() {
        this.systemConfigService.getAll().subscribe((data) => {
            const findVal = (code: string) =>
                data.find((c: any) => c.code === code)?.value

            const startAt = findVal('UKOM_SCHEDULE_START_AT')
            if (startAt != null) this.UNAVAILABLE_END_HOUR = Number(startAt)

            const endAt = findVal('UKOM_SCHEDULE_END_AT')
            if (endAt != null) this.UNAVAILABLE_START_HOUR = Number(endAt)

            const lunchStart = findVal('UKOM_SCHEDULE_START_LUNCH_AT')
            if (lunchStart != null)
                this.MIDDAY_UNAVAILABLE_START_HOUR = Number(lunchStart)

            const lunchEnd = findVal('UKOM_SCHEDULE_END_LUNCH_AT')
            if (lunchEnd != null)
                this.MIDDAY_UNAVAILABLE_END_HOUR = Number(lunchEnd)

            const weekendAllowed = findVal('UKOM_SCHEDULE_IS_WEEKEN_ALLOWED')
            if (weekendAllowed != null)
                this.disableWeekend = weekendAllowed.toLowerCase() === 'tidak'
        })
    }

    /**
     * Get hour from date (treating it as UTC+7)
     * Uses UTC methods to ignore browser timezone
     */
    private getHour(date: Date): number {
        return date.getUTCHours()
    }

    /**
     * Get minutes from date (treating it as UTC+7)
     * Uses UTC methods to ignore browser timezone
     */
    private getMinutes(date: Date): number {
        return date.getUTCMinutes()
    }

    /**
     * Check if date falls on weekend (Saturday or Sunday)
     */
    private isWeekend(date: Date): boolean {
        const dayOfWeek = date.getUTCDay() // 0 = Sunday, 6 = Saturday
        return dayOfWeek === 0 || dayOfWeek === 6
    }

    /**
     * Get next weekday (Monday) at 08:00
     * If on Saturday, skip to Monday 08:00
     * If on Sunday, skip to Monday 08:00
     */
    private getNextWeekday(date: Date): Date {
        const dayOfWeek = date.getUTCDay() // 0 = Sunday, 6 = Saturday
        const nextDate = new Date(date)

        if (dayOfWeek === 6) {
            // Saturday -> add 2 days to get Monday
            nextDate.setUTCDate(nextDate.getUTCDate() + 2)
        } else if (dayOfWeek === 0) {
            // Sunday -> add 1 day to get Monday
            nextDate.setUTCDate(nextDate.getUTCDate() + 1)
        }

        // Set to 08:00
        nextDate.setUTCHours(this.UNAVAILABLE_END_HOUR, 0, 0, 0)
        return nextDate
    }

    /**
     * Calculate the next available time after an unavailable period
     * If a slot overlaps with lunch (12:00-13:00), jump to 13:00
     * If a slot overlaps with night (17:00-08:00), jump to 08:00 next day
     */
    private getNextAvailableTimeAfterBreak(currentTime: Date): Date {
        const hour = this.getHour(currentTime)

        // If in lunch break (12:00-13:00), jump to 13:00 same day
        if (
            hour >= this.MIDDAY_UNAVAILABLE_START_HOUR &&
            hour < this.MIDDAY_UNAVAILABLE_END_HOUR
        ) {
            const nextTime = new Date(currentTime)
            nextTime.setUTCHours(this.MIDDAY_UNAVAILABLE_END_HOUR, 0, 0, 0)

            // Check if 13:00 falls on weekend, if so skip to Monday 08:00
            if (this.isWeekend(nextTime)) {
                return this.getNextWeekday(nextTime)
            }

            return nextTime
        }

        // If in night time (17:00-08:00), jump to 08:00 same or next day
        if (
            hour >= this.UNAVAILABLE_START_HOUR ||
            hour < this.UNAVAILABLE_END_HOUR
        ) {
            const nextTime = new Date(currentTime)
            // If currently before 08:00, stay same day
            if (hour < this.UNAVAILABLE_END_HOUR) {
                nextTime.setUTCHours(this.UNAVAILABLE_END_HOUR, 0, 0, 0)
            } else {
                // If currently after 17:00, jump to next day 08:00
                nextTime.setUTCDate(nextTime.getUTCDate() + 1)
                nextTime.setUTCHours(this.UNAVAILABLE_END_HOUR, 0, 0, 0)
            }

            // Check if next time falls on weekend, if so skip to Monday 08:00
            if (this.isWeekend(nextTime)) {
                return this.getNextWeekday(nextTime)
            }

            return nextTime
        }

        // No break to jump over, return same time
        return currentTime
    }

    /**
     * Check if a time slot falls within unavailable hours (17:00-08:00 UTC+7)
     * Handles cross-day unavailability
     * Times are treated as UTC+7 without conversion
     */
    private isSlotInUnavailableHours(slotStart: Date, slotEnd: Date): boolean {
        if (this.disableUnavailableHours) {
            return false
        }

        if (this.isSlotInMiddayUnavailableHours(slotStart, slotEnd)) {
            return true
        }

        // 00:00 to 08:00
        const morningNightStart = new Date(slotStart)
        morningNightStart.setUTCHours(0, 0, 0, 0)

        const morningNightEnd = new Date(slotStart)
        morningNightEnd.setUTCHours(this.UNAVAILABLE_END_HOUR, 0, 0, 0)

        // 17:00 to 24:00
        const eveningNightStart = new Date(slotStart)
        eveningNightStart.setUTCHours(this.UNAVAILABLE_START_HOUR, 0, 0, 0)

        const eveningNightEnd = new Date(slotStart)
        eveningNightEnd.setUTCDate(eveningNightEnd.getUTCDate() + 1)
        eveningNightEnd.setUTCHours(0, 0, 0, 0)

        const inMorningNight =
            slotStart < morningNightEnd && slotEnd > morningNightStart
        const inEveningNight =
            slotStart < eveningNightEnd && slotEnd > eveningNightStart

        return inMorningNight || inEveningNight
    }

    private isSlotInMiddayUnavailableHours(
        slotStart: Date,
        slotEnd: Date,
    ): boolean {
        const lunchStart = new Date(slotStart)
        lunchStart.setUTCHours(this.MIDDAY_UNAVAILABLE_START_HOUR, 0, 0, 0)

        const lunchEnd = new Date(slotStart)
        lunchEnd.setUTCHours(this.MIDDAY_UNAVAILABLE_END_HOUR, 0, 0, 0)

        return slotStart < lunchEnd && slotEnd > lunchStart
    }

    /**
     * Find participant scheduled in a specific slot
     * Matches if participant's schedule falls within the same minute as slot start (ignores seconds/milliseconds)
     */
    private findParticipantInSlot(
        slotStart: Date,
        participants: ParticipantSchedule[],
    ): ParticipantSchedule | null {
        return (
            participants.find((p) => {
                if (!p.personalSchedule) return false
                const scheduleTime = new Date(p.personalSchedule)

                // Match if within the same minute (ignore seconds and milliseconds)
                // This handles cases where API sends "2026-02-24 09:50:02" for slot "2026-02-24 09:50:00"
                const slotMinute = new Date(slotStart)
                slotMinute.setUTCSeconds(0, 0)

                const scheduleMinute = new Date(scheduleTime)
                scheduleMinute.setUTCSeconds(0, 0)

                return scheduleMinute.getTime() === slotMinute.getTime()
            }) || null
        )
    }
}
