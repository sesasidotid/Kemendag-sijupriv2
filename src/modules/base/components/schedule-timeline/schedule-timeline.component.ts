import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'

// Schedule item interface
export interface ScheduleItem {
    participantScheduleId: string
    examScheduleId?: string
    personalSchedule: string // ISO datetime string
    personalScheduleEnd: string | null // ISO datetime string (optional, can be computed from start + duration)
    duration: number // hours (e.g., 0.25, 0.5, 1)
    participantId?: string
    name: string
    email?: string
    phone?: string
    nip?: string
    nextJabatanName: string
    nextJenjangName: string
    unitKerjaName?: string
    jenisUkom: string // subclass identifier
    jenisUjian: string
    examinerName: string | null
}

// Processed schedule with computed values
interface ProcessedSchedule extends ScheduleItem {
    startTime: Date
    endTime: Date
    startMinutes: number // minutes from timeline start
    durationMinutes: number
    lane: number
    color: string
}

// Zoom level configuration
interface ZoomLevel {
    label: string
    minutesPerUnit: number
    pixelsPerMinute: number
}

@Component({
    selector: 'app-schedule-timeline',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './schedule-timeline.component.html',
    styleUrl: './schedule-timeline.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleTimelineComponent implements OnInit, OnChanges {
    @Input() schedules: ScheduleItem[] = []
    @Output() closeTimeline = new EventEmitter<void>()

    // Zoom levels: 15m, 30m, 1h
    readonly zoomLevels: ZoomLevel[] = [
        { label: '15m', minutesPerUnit: 15, pixelsPerMinute: 4 },
        { label: '30m', minutesPerUnit: 30, pixelsPerMinute: 2 },
        { label: '1h', minutesPerUnit: 60, pixelsPerMinute: 1 },
    ]

    currentZoomIndex$ = new BehaviorSubject<number>(1) // Default 30m
    processedSchedules$ = new BehaviorSubject<ProcessedSchedule[]>([])
    lanes$ = new BehaviorSubject<number[]>([])
    timeMarkers$ = new BehaviorSubject<
        { time: string; position: number; isNewDay: boolean }[]
    >([])
    timelineWidth$ = new BehaviorSubject<number>(0)
    hoveredSchedule$ = new BehaviorSubject<ProcessedSchedule | null>(null)
    tooltipPosition$ = new BehaviorSubject<{ x: number; y: number }>({
        x: 0,
        y: 0,
    })
    // Color palette for jabatanName
    colorPalette: Record<string, string> = {
        'Analis Perdagangan': '#FF9800',
        'Pengawas Perdagangan': '#9C27B0',
        'Penguji Mutu Barang': '#E91E63',
        'Pengamat Tera': '#00BCD4',
        Penera: '#2196F3',
        'Negosiator Perdagangan': '#4CAF50',
        DEFAULT: '#607D8B',
    }
    private timelineStart: Date = new Date()
    private timelineEnd: Date = new Date()

    // Get current zoom level
    get currentZoom(): ZoomLevel {
        return this.zoomLevels[this.currentZoomIndex$.value]
    }

    ngOnInit(): void {
        this.processSchedules()
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['schedules']) {
            this.processSchedules()
        }
    }

    // Track by function for performance
    trackByScheduleId(index: number, item: ProcessedSchedule): string {
        return item.participantScheduleId
    }

    trackByLane(index: number, lane: number): number {
        return lane
    }

    trackByMarker(
        index: number,
        marker: { time: string; position: number; isNewDay: boolean },
    ): number {
        return marker.position
    }

    // Zoom control
    setZoom(index: number): void {
        this.currentZoomIndex$.next(index)
        this.processSchedules()
    }

    // Format time for display with date
    formatTimeWithDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0')
        const month = date.toLocaleString('id-ID', { month: 'short' })
        const hour = date.getHours().toString().padStart(2, '0')
        const minute = date.getMinutes().toString().padStart(2, '0')
        return `${day} ${month} ${hour}:${minute}`
    }

    // Format datetime for tooltip
    formatDateTime(date: Date): string {
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Format duration for tooltip
    formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} menit`
        }
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        if (remainingMinutes === 0) {
            return `${hours} jam`
        }
        return `${hours} jam ${remainingMinutes} menit`
    }

    // Get schedule style
    getScheduleStyle(schedule: ProcessedSchedule): Record<string, string> {
        const left = schedule.startMinutes * this.currentZoom.pixelsPerMinute
        const width =
            schedule.durationMinutes * this.currentZoom.pixelsPerMinute

        return {
            left: `${left}px`,
            width: `${Math.max(width, 20)}px`, // Minimum width for visibility
            'background-color': schedule.color,
        }
    }

    // Tooltip handlers
    showTooltip(event: MouseEvent, schedule: ProcessedSchedule): void {
        this.hoveredSchedule$.next(schedule)
        this.updateTooltipPosition(event)
    }

    hideTooltip(): void {
        this.hoveredSchedule$.next(null)
    }

    moveTooltip(event: MouseEvent): void {
        if (this.hoveredSchedule$.value) {
            this.updateTooltipPosition(event)
        }
    }

    // Close modal
    close(): void {
        this.closeTimeline.emit()
    }

    private getColor(nextJabatanName: string): string {
        return (
            this.colorPalette[nextJabatanName] || this.colorPalette['DEFAULT']
        )
    }

    // Parse datetime string to Date
    private parseDateTime(dateStr: string | null): Date {
        if (!dateStr) {
            return new Date() // Return current date as fallback
        }
        // Handle format "2026-02-06 13:53:00" (space between date and time)
        const normalized = dateStr.replace(' ', 'T')
        return new Date(normalized)
    }

    // Process schedules and compute lanes
    private processSchedules(): void {
        if (!this.schedules || this.schedules.length === 0) {
            this.processedSchedules$.next([])
            this.lanes$.next([])
            this.timeMarkers$.next([])
            return
        }

        // Convert to processed schedules with computed times
        const processed: ProcessedSchedule[] = this.schedules.map((s) => {
            const startTime = this.parseDateTime(s.personalSchedule)
            const durationMinutes = Math.round(s.duration * 60)
            const endTime = new Date(
                startTime.getTime() + durationMinutes * 60000,
            )

            return {
                ...s,
                startTime,
                endTime,
                startMinutes: 0, // Will be computed after finding timeline bounds
                durationMinutes,
                lane: 0,
                color: this.getColor(s.nextJabatanName || ''),
            }
        })

        // Sort by start time (deterministic packing)
        processed.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

        // Find timeline bounds
        this.timelineStart = new Date(
            Math.min(...processed.map((s) => s.startTime.getTime())),
        )
        this.timelineEnd = new Date(
            Math.max(...processed.map((s) => s.endTime.getTime())),
        )

        // Add padding to timeline bounds (30 minutes on each side)
        this.timelineStart = new Date(this.timelineStart.getTime() - 30 * 60000)
        this.timelineEnd = new Date(this.timelineEnd.getTime() + 30 * 60000)

        // Round to nearest interval
        const interval = this.currentZoom.minutesPerUnit
        this.timelineStart = this.roundDownToInterval(
            this.timelineStart,
            interval,
        )
        this.timelineEnd = this.roundUpToInterval(this.timelineEnd, interval)

        // Compute start minutes relative to timeline start
        processed.forEach((s) => {
            s.startMinutes =
                (s.startTime.getTime() - this.timelineStart.getTime()) / 60000
        })

        // Interval packing algorithm
        const lanes: { endMinutes: number }[] = []

        processed.forEach((schedule) => {
            let placed = false
            const scheduleStart = schedule.startMinutes
            const scheduleEnd = scheduleStart + schedule.durationMinutes

            // Find first lane where schedule fits
            for (let i = 0; i < lanes.length; i++) {
                if (scheduleStart >= lanes[i].endMinutes) {
                    schedule.lane = i
                    lanes[i].endMinutes = scheduleEnd
                    placed = true
                    break
                }
            }

            // Create new lane if necessary
            if (!placed) {
                schedule.lane = lanes.length
                lanes.push({ endMinutes: scheduleEnd })
            }
        })

        // Calculate timeline width
        const totalMinutes =
            (this.timelineEnd.getTime() - this.timelineStart.getTime()) / 60000
        const width = totalMinutes * this.currentZoom.pixelsPerMinute
        this.timelineWidth$.next(width)

        // Generate time markers
        const markers: { time: string; position: number; isNewDay: boolean }[] =
            []
        let currentTime = new Date(this.timelineStart)
        let lastDate = -1

        while (currentTime <= this.timelineEnd) {
            const position =
                ((currentTime.getTime() - this.timelineStart.getTime()) /
                    60000) *
                this.currentZoom.pixelsPerMinute
            const isNewDay = currentTime.getDate() !== lastDate
            lastDate = currentTime.getDate()

            markers.push({
                time: isNewDay
                    ? this.formatTimeWithDate(currentTime)
                    : this.formatTimeOnly(currentTime),
                position,
                isNewDay,
            })
            currentTime = new Date(
                currentTime.getTime() + this.currentZoom.minutesPerUnit * 60000,
            )
        }

        this.timeMarkers$.next(markers)
        this.lanes$.next(Array.from({ length: lanes.length }, (_, i) => i))
        this.processedSchedules$.next(processed)
    }

    // Round down to interval
    private roundDownToInterval(date: Date, intervalMinutes: number): Date {
        const minutes = date.getMinutes()
        const roundedMinutes =
            Math.floor(minutes / intervalMinutes) * intervalMinutes
        const result = new Date(date)
        result.setMinutes(roundedMinutes, 0, 0)
        return result
    }

    // Round up to interval
    private roundUpToInterval(date: Date, intervalMinutes: number): Date {
        const minutes = date.getMinutes()
        const roundedMinutes =
            Math.ceil(minutes / intervalMinutes) * intervalMinutes
        const result = new Date(date)
        result.setMinutes(roundedMinutes, 0, 0)
        return result
    }

    // Format time only (for non-first markers of the same day)
    private formatTimeOnly(date: Date): string {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    private updateTooltipPosition(event: MouseEvent): void {
        const offset = 15
        const tooltipWidth = 300 // max-width from CSS
        const tooltipMinHeight = 200 // minimum estimated height

        // Get viewport dimensions
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // Calculate initial position (bottom-right of cursor)
        let x = event.clientX + offset
        let y = event.clientY + offset

        // Check if tooltip would overflow on the right
        if (x + tooltipWidth > viewportWidth) {
            // Position to the left of cursor
            x = event.clientX - tooltipWidth - offset
        }

        // Check if tooltip would overflow at the bottom
        if (y + tooltipMinHeight > viewportHeight) {
            // Position above cursor
            y = event.clientY - tooltipMinHeight - offset
        }

        // Ensure tooltip doesn't go off the left edge
        if (x < 0) {
            x = offset
        }

        // Ensure tooltip doesn't go off the top edge
        if (y < 0) {
            y = offset
        }

        this.tooltipPosition$.next({ x, y })
    }
}
