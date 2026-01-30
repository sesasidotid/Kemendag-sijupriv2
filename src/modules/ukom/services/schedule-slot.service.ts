import { Injectable } from '@angular/core'
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
    private readonly UNAVAILABLE_START_HOUR = 20 // 20:00 UTC+7
    private readonly UNAVAILABLE_END_HOUR = 6 // 06:00 UTC+7
    private readonly MIDDAY_UNAVAILABLE_START_HOUR = 12 // 12:00
    private readonly MIDDAY_UNAVAILABLE_END_HOUR = 13 // 13:00

    /** Feature toggle */
    private disableUnavailableHours = true

    /**
     * Parse date string as UTC+7 time (no timezone conversion)
     * Input: '2025-01-15T08:00:00' -> Date with UTC time 08:00 (treated as UTC+7)
     */
    parseAsUTC7(dateString: string | Date): Date {
        if (dateString instanceof Date) {
            return dateString
        }
        // Parse as UTC to avoid browser timezone interpretation
        // Remove timezone suffix if present and append 'Z' to parse as UTC
        const cleanString = dateString.replace(/[+-]\d{2}:\d{2}$/, '') + 'Z'
        return new Date(cleanString)
    }

    /**
     * Generate all possible time slots within main schedule
     * Skips unavailable periods (12:00-13:00 lunch, 20:00-06:00 night) and resumes slots after breaks
     * Example: If exam starts 09:33 with 2h duration:
     *   - Slot 0: 09:33-11:33 ✅
     *   - 11:33-13:33 would overlap lunch, skip to 13:00
     *   - Slot 1: 13:00-15:00 ✅
     *   - Slot 2: 15:00-17:00 ✅
     */
    generateAllSlots(mainSchedule: MainSchedule): ScheduleSlot[] {
        const slots: ScheduleSlot[] = []
        const durationMs = mainSchedule.duration * 60 * 60 * 1000

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

        // Check unavailable hours
        const slotEndTime = new Date(
            newSlotTime.getTime() + mainSchedule.duration * 60 * 60 * 1000,
        )
        if (this.isSlotInUnavailableHours(newSlotTime, slotEndTime)) {
            return {
                valid: false,
                reason: 'Slot berada di jam tidak tersedia (20:00-06:00 atau 12:00-13:00)',
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
     * Calculate the next available time after an unavailable period
     * If a slot overlaps with lunch (12:00-13:00), jump to 13:00
     * If a slot overlaps with night (20:00-06:00), jump to 06:00 next day
     */
    private getNextAvailableTimeAfterBreak(currentTime: Date): Date {
        const hour = this.getHour(currentTime)

        // If in or before lunch break, jump to 13:00 same day
        if (hour < this.MIDDAY_UNAVAILABLE_END_HOUR) {
            const nextTime = new Date(currentTime)
            nextTime.setUTCHours(this.MIDDAY_UNAVAILABLE_END_HOUR, 0, 0, 0)
            return nextTime
        }

        // If in or before night time, jump to 06:00 next day
        if (
            hour >= this.UNAVAILABLE_START_HOUR ||
            hour < this.UNAVAILABLE_END_HOUR
        ) {
            const nextTime = new Date(currentTime)
            // If currently before 06:00, stay same day
            if (hour < this.UNAVAILABLE_END_HOUR) {
                nextTime.setUTCHours(this.UNAVAILABLE_END_HOUR, 0, 0, 0)
            } else {
                // If currently after 20:00, jump to next day 06:00
                nextTime.setUTCDate(nextTime.getUTCDate() + 1)
                nextTime.setUTCHours(this.UNAVAILABLE_END_HOUR, 0, 0, 0)
            }
            return nextTime
        }

        // No break to jump over, return same time
        return currentTime
    }

    /**
     * Check if a time slot falls within unavailable hours (20:00-06:00 UTC+7)
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

        const startHour = this.getHour(slotStart)
        const endHour = this.getHour(slotEnd)
        const endMinute = this.getMinutes(slotEnd)

        // Check if slot start is in blackout period
        if (
            startHour >= this.UNAVAILABLE_START_HOUR ||
            startHour < this.UNAVAILABLE_END_HOUR
        ) {
            return true
        }

        // Check if slot end is in blackout period (considering minutes)
        if (endHour < this.UNAVAILABLE_END_HOUR) {
            return true
        }

        // Check if slot end exactly at 06:00 (edge case)
        if (endHour === this.UNAVAILABLE_END_HOUR && endMinute === 0) {
            return true
        }

        // Check if slot crosses into blackout period
        if (endHour >= this.UNAVAILABLE_START_HOUR) {
            return true
        }

        return false
    }

    private isSlotInMiddayUnavailableHours(
        slotStart: Date,
        slotEnd: Date,
    ): boolean {
        const startHour = this.getHour(slotStart)
        const endHour = this.getHour(slotEnd)
        const endMinute = this.getMinutes(slotEnd)

        // Slot starts during 12–13
        if (
            startHour >= this.MIDDAY_UNAVAILABLE_START_HOUR &&
            startHour < this.MIDDAY_UNAVAILABLE_END_HOUR
        ) {
            return true
        }

        // Slot ends during 12–13 (but not exactly at 12:00)
        if (
            endHour > this.MIDDAY_UNAVAILABLE_START_HOUR &&
            endHour < this.MIDDAY_UNAVAILABLE_END_HOUR
        ) {
            return true
        }

        // Edge case: slot ends exactly at 13:00
        if (endHour === this.MIDDAY_UNAVAILABLE_END_HOUR && endMinute === 0) {
            return true
        }

        // Check if slot spans across the 12:00-13:00 period
        // (starts before 12:00 and ends after 13:00)
        if (
            startHour < this.MIDDAY_UNAVAILABLE_START_HOUR &&
            (endHour > this.MIDDAY_UNAVAILABLE_END_HOUR ||
                (endHour === this.MIDDAY_UNAVAILABLE_END_HOUR && endMinute > 0))
        ) {
            return true
        }

        return false
    }

    /**
     * Find participant scheduled in a specific slot
     */
    private findParticipantInSlot(
        slotStart: Date,
        participants: ParticipantSchedule[],
    ): ParticipantSchedule | null {
        return (
            participants.find((p) => {
                if (!p.personalSchedule) return false
                const scheduleTime = new Date(p.personalSchedule)
                return scheduleTime.getTime() === slotStart.getTime()
            }) || null
        )
    }
}
