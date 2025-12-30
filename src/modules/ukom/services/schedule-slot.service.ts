import { Injectable } from '@angular/core'
import { MainSchedule, ParticipantSchedule, ScheduleSlot } from '../models/schedule-slot.model'

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
     * Filters out unavailable hours (20:00-06:00)
     */
    generateAllSlots(mainSchedule: MainSchedule): ScheduleSlot[] {
        const slots: ScheduleSlot[] = []
        const durationMs = mainSchedule.duration * 60 * 60 * 1000
        
        let currentSlotStart = new Date(mainSchedule.startTime)
        let slotIndex = 0

        while (currentSlotStart < mainSchedule.endTime) {
            const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMs)
            
            // Stop if slot end exceeds main schedule end
            if (currentSlotEnd > mainSchedule.endTime) {
                break
            }

            const isUnavailable = this.isSlotInUnavailableHours(currentSlotStart, currentSlotEnd)
            const occupiedParticipant = this.findParticipantInSlot(
                currentSlotStart,
                mainSchedule.participantScheduleList
            )

            slots.push({
                slotIndex: slotIndex,
                startTime: new Date(currentSlotStart),
                endTime: new Date(currentSlotEnd),
                isOccupied: !!occupiedParticipant,
                isUnavailable: isUnavailable,
                participantSchedule: occupiedParticipant || undefined,
            })

            slotIndex++
            currentSlotStart = new Date(currentSlotEnd)
        }

        return slots
    }

    /**
     * Check if a time slot falls within unavailable hours (20:00-06:00 UTC+7)
     * Handles cross-day unavailability
     * Times are treated as UTC+7 without conversion
     */
    private isSlotInUnavailableHours(slotStart: Date, slotEnd: Date): boolean {
        const startHour = this.getHour(slotStart)
        const endHour = this.getHour(slotEnd)
        const endMinute = this.getMinutes(slotEnd)

        // Check if slot start is in blackout period
        if (startHour >= this.UNAVAILABLE_START_HOUR || startHour < this.UNAVAILABLE_END_HOUR) {
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

    /**
     * Find participant scheduled in a specific slot
     */
    private findParticipantInSlot(
        slotStart: Date,
        participants: ParticipantSchedule[]
    ): ParticipantSchedule | null {
        return participants.find(p => {
            if (!p.personalSchedule) return false
            const scheduleTime = new Date(p.personalSchedule)
            return scheduleTime.getTime() === slotStart.getTime()
        }) || null
    }

    /**
     * Get available slots for rescheduling
     * Excludes occupied and unavailable slots
     */
    getAvailableSlots(allSlots: ScheduleSlot[]): ScheduleSlot[] {
        return allSlots.filter(slot => !slot.isOccupied && !slot.isUnavailable)
    }

    /**
     * Validate if a reschedule request is valid
     */
    validateReschedule(
        newSlotTime: Date,
        mainSchedule: MainSchedule,
        excludeParticipantId?: string
    ): { valid: boolean; reason?: string } {
        // Check if time is within main schedule
        if (newSlotTime < mainSchedule.startTime || newSlotTime >= mainSchedule.endTime) {
            return { 
                valid: false, 
                reason: 'Waktu di luar jadwal utama' 
            }
        }

        // Check unavailable hours
        const slotEndTime = new Date(newSlotTime.getTime() + mainSchedule.duration * 60 * 60 * 1000)
        if (this.isSlotInUnavailableHours(newSlotTime, slotEndTime)) {
            return { 
                valid: false, 
                reason: 'Slot berada di jam tidak tersedia (20:00-06:00)' 
            }
        }

        // Check overlap with other participants
        const overlappingParticipant = mainSchedule.participantScheduleList.find(p => {
            if (excludeParticipantId && p.participantId === excludeParticipantId) {
                return false // Skip the participant being rescheduled
            }
            if (!p.personalSchedule) return false
            const existingTime = new Date(p.personalSchedule)
            return existingTime.getTime() === newSlotTime.getTime()
        })

        if (overlappingParticipant) {
            return { 
                valid: false, 
                reason: `Slot sudah ditempati oleh ${overlappingParticipant.participantName}` 
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
}
