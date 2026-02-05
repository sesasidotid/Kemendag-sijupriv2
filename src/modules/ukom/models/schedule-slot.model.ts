/**
 * Schedule Slot Models for Admin Manual Rescheduling
 *
 * Business Rules:
 * - Personal schedules must be within main schedule boundaries
 * - No overlapping participant slots
 * - Unavailable hours: 20:00 → 06:00 (daily blackout)
 * - All participants share the same duration
 */

export interface MainSchedule {
    id: string
    startTime: Date
    endTime: Date
    duration: number // in hours (e.g., 0.5 = 30 minutes)
    participantScheduleList: ParticipantSchedule[]
}

export interface ParticipantSchedule {
    id: string
    participantId: string
    examScheduleId: string
    personalSchedule: Date | null
    participantName: string // denormalized for display
    participantNip?: string
    examinerName: string // Deprecated: for backward compatibility
    examinerKomponenA?: string // Examiner for Komponen A (index 0)
    examinerKomponenBC?: string // Examiner for Komponen B & C (index 1)
}

export interface ScheduleSlot {
    slotIndex: number
    startTime: Date
    endTime: Date
    isOccupied: boolean
    isUnavailable: boolean // 20:00-06:00 blackout
    participantSchedule?: ParticipantSchedule
}

export interface RescheduleRequest {
    participantScheduleId: string
    participantId: string
    newPersonalSchedule: Date
    examScheduleId: string
}
