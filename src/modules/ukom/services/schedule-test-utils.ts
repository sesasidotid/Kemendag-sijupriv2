import { ScheduleSlotService } from '@/modules/ukom/services/schedule-slot.service'
import { MainSchedule, ParticipantSchedule, ScheduleSlot } from '@/modules/ukom/models/schedule-slot.model'

/**
 * TEST UTILITIES AND MOCK DATA GENERATORS
 * 
 * Use these utilities for unit testing and development
 * Timezone: UTC+7 (Asia/Jakarta)
 */
export class ScheduleTestUtils {
    private slotService = new ScheduleSlotService()

    /**
     * Generate a test main schedule
     */
    generateTestMainSchedule(params?: {
        startTime?: Date
        endTime?: Date
        duration?: number
        participantCount?: number
    }): MainSchedule {
        const start = params?.startTime || new Date('2025-01-15T08:00:00')
        const end = params?.endTime || new Date('2025-01-15T18:00:00')
        const duration = params?.duration || 0.5
        const count = params?.participantCount || 5

        const participants: ParticipantSchedule[] = []
        let currentTime = new Date(start)

        for (let i = 0; i < count; i++) {
            participants.push({
                id: `ps-${i + 1}`,
                participantId: `p-${i + 1}`,
                examScheduleId: 'exam-001',
                personalSchedule: new Date(currentTime),
                participantName: `Participant ${i + 1}`,
                participantNip: `${198500000 + i}`,
            })

            // Move to next slot
            currentTime = new Date(currentTime.getTime() + duration * 60 * 60 * 1000)
        }

        return {
            id: 'exam-001',
            startTime: start,
            endTime: end,
            duration: duration,
            participantScheduleList: participants,
        }
    }

    /**
     * Generate schedule with unavailable hours
     */
    generateScheduleWithUnavailableHours(): MainSchedule {
        return {
            id: 'exam-002',
            startTime: new Date('2025-01-15T18:00:00'), // 6 PM
            endTime: new Date('2025-01-16T08:00:00'), // 8 AM next day
            duration: 0.5,
            participantScheduleList: [
                {
                    id: 'ps-1',
                    participantId: 'p-1',
                    examScheduleId: 'exam-002',
                    personalSchedule: new Date('2025-01-15T18:00:00'), // Valid: before 20:00
                    participantName: 'John Doe',
                },
                {
                    id: 'ps-2',
                    participantId: 'p-2',
                    examScheduleId: 'exam-002',
                    personalSchedule: new Date('2025-01-15T19:30:00'), // Valid: before 20:00
                    participantName: 'Jane Smith',
                },
                // Slots from 20:00 to 06:00 will be marked as unavailable
            ],
        }
    }

    /**
     * Test slot generation
     */
    testSlotGeneration(): void {
        console.log('=== Testing Slot Generation ===')
        
        const schedule = this.generateTestMainSchedule({
            startTime: new Date('2025-01-15T08:00:00'),
            endTime: new Date('2025-01-15T12:00:00'),
            duration: 0.5,
            participantCount: 3,
        })

        const slots = this.slotService.generateAllSlots(schedule)
        
        console.log('Main Schedule:', {
            start: schedule.startTime,
            end: schedule.endTime,
            duration: schedule.duration,
            participants: schedule.participantScheduleList.length,
        })
        
        console.log('Generated Slots:', slots.length)
        console.log('Occupied Slots:', slots.filter(s => s.isOccupied).length)
        console.log('Available Slots:', slots.filter(s => !s.isOccupied && !s.isUnavailable).length)
        console.log('Unavailable Slots:', slots.filter(s => s.isUnavailable).length)

        // Display first 5 slots
        console.log('\nFirst 5 Slots:')
        slots.slice(0, 5).forEach(slot => {
            console.log(`  Slot ${slot.slotIndex}: ${slot.startTime.toLocaleTimeString()} - ${slot.endTime.toLocaleTimeString()}`, {
                occupied: slot.isOccupied,
                unavailable: slot.isUnavailable,
                participant: slot.participantSchedule?.participantName || 'none',
            })
        })
    }

    /**
     * Test unavailable hours detection
     */
    testUnavailableHours(): void {
        console.log('\n=== Testing Unavailable Hours (20:00-06:00) ===')
        
        const testCases = [
            { start: new Date('2025-01-15T08:00:00'), end: new Date('2025-01-15T08:30:00'), expected: false },
            { start: new Date('2025-01-15T19:30:00'), end: new Date('2025-01-15T20:00:00'), expected: false },
            { start: new Date('2025-01-15T20:00:00'), end: new Date('2025-01-15T20:30:00'), expected: true },
            { start: new Date('2025-01-15T23:00:00'), end: new Date('2025-01-15T23:30:00'), expected: true },
            { start: new Date('2025-01-15T05:30:00'), end: new Date('2025-01-15T06:00:00'), expected: true },
            { start: new Date('2025-01-15T06:00:00'), end: new Date('2025-01-15T06:30:00'), expected: false },
        ]

        testCases.forEach(({ start, end, expected }) => {
            const schedule: MainSchedule = {
                id: 'test',
                startTime: start,
                endTime: end,
                duration: 0.5,
                participantScheduleList: [],
            }

            const slots = this.slotService.generateAllSlots(schedule)
            const isUnavailable = slots.length > 0 ? slots[0].isUnavailable : false

            const status = isUnavailable === expected ? '✓' : '✗'
            console.log(`${status} ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}: ${isUnavailable} (expected: ${expected})`)
        })
    }

    /**
     * Test validation logic
     */
    testValidation(): void {
        console.log('\n=== Testing Reschedule Validation ===')
        
        const schedule = this.generateTestMainSchedule()
        
        const testCases = [
            {
                name: 'Valid slot (within bounds, available)',
                time: new Date('2025-01-15T14:00:00'),
                expectedValid: true,
            },
            {
                name: 'Invalid: before start time',
                time: new Date('2025-01-15T07:00:00'),
                expectedValid: false,
            },
            {
                name: 'Invalid: after end time',
                time: new Date('2025-01-15T18:30:00'),
                expectedValid: false,
            },
            {
                name: 'Invalid: unavailable hours (20:00)',
                time: new Date('2025-01-15T20:00:00'),
                expectedValid: false,
            },
            {
                name: 'Invalid: occupied slot',
                time: schedule.participantScheduleList[0].personalSchedule!,
                expectedValid: false,
            },
        ]

        testCases.forEach(test => {
            const result = this.slotService.validateReschedule(test.time, schedule)
            const status = result.valid === test.expectedValid ? '✓' : '✗'
            console.log(`${status} ${test.name}: ${result.valid} ${result.reason ? `(${result.reason})` : ''}`)
        })
    }

    /**
     * Performance test with many participants
     */
    testPerformance(): void {
        console.log('\n=== Performance Test: 500 Participants ===')
        
        const start = performance.now()
        
        const schedule = this.generateTestMainSchedule({
            startTime: new Date('2025-01-15T08:00:00'),
            endTime: new Date('2025-01-15T18:00:00'),
            duration: 0.5,
            participantCount: 500,
        })

        const slots = this.slotService.generateAllSlots(schedule)
        const availableSlots = this.slotService.getAvailableSlots(slots)

        const end = performance.now()
        
        console.log('Results:')
        console.log(`  Total slots: ${slots.length}`)
        console.log(`  Occupied: ${slots.filter(s => s.isOccupied).length}`)
        console.log(`  Available: ${availableSlots.length}`)
        console.log(`  Unavailable: ${slots.filter(s => s.isUnavailable).length}`)
        console.log(`  Time: ${(end - start).toFixed(2)}ms`)
    }

    /**
     * Run all tests
     */
    runAllTests(): void {
        this.testSlotGeneration()
        this.testUnavailableHours()
        this.testValidation()
        this.testPerformance()
        console.log('\n=== All Tests Complete ===')
    }
}

/**
 * USAGE IN BROWSER CONSOLE:
 * 
 * import { ScheduleTestUtils } from './schedule-test-utils'
 * const utils = new ScheduleTestUtils()
 * utils.runAllTests()
 */

/**
 * JASMINE UNIT TEST EXAMPLE:
 * 
 * describe('ScheduleSlotService', () => {
 *     let service: ScheduleSlotService
 *     let utils: ScheduleTestUtils
 * 
 *     beforeEach(() => {
 *         service = new ScheduleSlotService()
 *         utils = new ScheduleTestUtils()
 *     })
 * 
 *     it('should generate correct number of slots', () => {
 *         const schedule = utils.generateTestMainSchedule({
 *             startTime: new Date('2025-01-15T08:00:00'),
 *             endTime: new Date('2025-01-15T12:00:00'),
 *             duration: 0.5
 *         })
 *         const slots = service.generateAllSlots(schedule)
 *         expect(slots.length).toBe(8) // 4 hours / 0.5 = 8 slots
 *     })
 * 
 *     it('should mark slots as unavailable during 20:00-06:00', () => {
 *         const schedule = utils.generateScheduleWithUnavailableHours()
 *         const slots = service.generateAllSlots(schedule)
 *         const unavailable = slots.filter(s => s.isUnavailable)
 *         expect(unavailable.length).toBeGreaterThan(0)
 *     })
 * 
 *     it('should reject reschedule to occupied slot', () => {
 *         const schedule = utils.generateTestMainSchedule()
 *         const occupiedTime = schedule.participantScheduleList[0].personalSchedule!
 *         const result = service.validateReschedule(occupiedTime, schedule)
 *         expect(result.valid).toBe(false)
 *         expect(result.reason).toContain('ditempati')
 *     })
 * })
 */
