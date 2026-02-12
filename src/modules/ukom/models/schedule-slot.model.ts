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
    examinerKomponenA?: string // Examiner name for Komponen A (from makalah schedule)
    examinerKomponenBC?: string // Examiner name for Komponen B & C (from seminar schedule)
    // IDs for separate examiner updates
    makalahParticipantScheduleId?: string // participant_schedule ID on the makalah exam schedule
    seminarParticipantScheduleId?: string // participant_schedule ID on the seminar exam schedule
    examinerIdKomponenA?: string // examiner_schedule ID for Komponen A
    examinerIdKomponenBC?: string // examiner_schedule ID for Komponen B & C
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
