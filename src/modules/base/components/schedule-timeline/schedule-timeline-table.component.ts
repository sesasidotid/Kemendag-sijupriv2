import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { AgGridAngular } from 'ag-grid-angular'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { ScheduleItem } from './schedule-timeline.component'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'

// Processed schedule row for table
interface ScheduleTableRow {
    index: number
    participantScheduleId: string
    name: string
    nextJabatanName: string
    nextJenjangName: string
    jenisUkom: string
    unitKerjaName: string
    nip: string
    email: string
    phone: string
    startTime: Date
    endTime: Date
    duration: number
    durationMinutes: number
    formattedStartTime: string
    formattedEndTime: string
    formattedDate: string
    formattedDuration: string
    color: string
    lane: number
    hasConflict: boolean
    conflictCount: number
    examinerName: string
}

@Component({
    selector: 'app-schedule-timeline-table',
    standalone: true,
    imports: [CommonModule, AgGridAngular],
    templateUrl: './schedule-timeline-table.component.html',
    styleUrl: './schedule-timeline-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleTimelineTableComponent implements OnInit, OnChanges {
    @Input() schedules: ScheduleItem[] = []
    @Output() closeTimeline = new EventEmitter<void>()

    processedRows$ = new BehaviorSubject<ScheduleTableRow[]>([])
    summary$ = new BehaviorSubject<{
        total: number
        withConflicts: number
        uniqueDates: number
        totalLanes: number
    }>({ total: 0, withConflicts: 0, uniqueDates: 0, totalLanes: 0 })

    columnDefs: ColDef[] = []
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }

    ukomMiscellaneousService = inject(UkomMiscellaneousService)

    // Color palette for jabatanName
    colorPalette: Record<string, string> = {
        'Negosiator Perdagangan': '#4CAF50',
        Penera: '#2196F3',
        'Analis Perdagangan': '#FF9800',
        'Pengawas Perdagangan': '#9C27B0',
        'Penguji Mutu Barang': '#E91E63',
        'Pengamat Tera': '#00BCD4',
        DEFAULT: '#607D8B',
    }

    private gridApi!: GridApi

    ngOnInit(): void {
        this.initializeColumnDefs()
        this.processSchedules()
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['schedules']) {
            this.processSchedules()
        }
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    close(): void {
        this.closeTimeline.emit()
    }

    private initializeColumnDefs(): void {
        this.columnDefs = [
            {
                headerName: '#',
                field: 'index',
                width: 70,
                valueFormatter: (params) => `${params.value}`,
                cellClass: 'text-center',
                pinned: 'left',
            },
            {
                headerName: 'Nama Penguji',
                field: 'examinerName',
                width: 180,
                pinned: 'left',
                cellStyle: (params) => {
                    const row = params.data as ScheduleTableRow
                    return {
                        borderLeft: `4px solid ${row.color}`,
                        fontWeight: '500',
                    }
                },
            },
            {
                headerName: 'Nama Peserta',
                field: 'name',
                width: 180,
                pinned: 'left',
                cellStyle: (params) => {
                    const row = params.data as ScheduleTableRow
                    return {
                        borderLeft: `4px solid ${row.color}`,
                        fontWeight: '500',
                    }
                },
            },
            {
                headerName: 'Tanggal',
                field: 'formattedDate',
                width: 140,
                sort: 'asc',
            },
            {
                headerName: 'Waktu Mulai',
                field: 'formattedStartTime',
                width: 120,
            },
            {
                headerName: 'Waktu Selesai',
                field: 'formattedEndTime',
                width: 120,
            },
            {
                headerName: 'Durasi',
                field: 'formattedDuration',
                width: 100,
                cellClass: 'text-center',
            },
            {
                headerName: 'Jabatan yang Dituju',
                field: 'nextJabatanName',
                width: 140,
                cellStyle: (params) => {
                    const row = params.data as ScheduleTableRow
                    return {
                        backgroundColor: row.color + '20',
                        color: row.color,
                        fontWeight: '600',
                    }
                },
            },
            {
                headerName: 'Jenjang yang Dituju',
                field: 'nextJenjangName',
                width: 120,
            },
            {
                headerName: 'Jenis Ujian',
                field: 'jenisUjian',
                width: 120,
            },
            {
                headerName: 'Jenis Ukom',
                field: 'jenisUkom',
                width: 180,
            },
            {
                headerName: 'Unit Kerja',
                field: 'unitKerjaName',
                width: 150,
            },
            {
                headerName: 'NIP',
                field: 'nip',
                width: 180,
            },
            {
                headerName: 'Lane',
                field: 'lane',
                width: 80,
                cellClass: 'text-center',
                valueFormatter: (params) => `#${params.value + 1}`,
            },
        ]
    }

    private processSchedules(): void {
        if (!this.schedules || this.schedules.length === 0) {
            this.processedRows$.next([])
            this.summary$.next({
                total: 0,
                withConflicts: 0,
                uniqueDates: 0,
                totalLanes: 0,
            })
            return
        }

        // Convert to processed rows
        const rows: ScheduleTableRow[] = this.schedules.map((s, index) => {
            const startTime = this.parseDateTime(s.personalSchedule)
            const durationMinutes = Math.round(s.duration * 60)
            const endTime = new Date(
                startTime.getTime() + durationMinutes * 60000,
            )

            return {
                index: index + 1,
                participantScheduleId: s.participantScheduleId,
                name: s.name,
                nextJabatanName: s.nextJabatanName || '',
                nextJenjangName: s.nextJenjangName || '',
                jenisUjian: s.jenisUjian,
                jenisUkom: s.jenisUkom,
                unitKerjaName: s.unitKerjaName || '',
                nip: s.nip || '',
                email: s.email || '',
                phone: s.phone || '',
                startTime,
                endTime,
                duration: s.duration,
                durationMinutes,
                formattedStartTime: this.formatTime(startTime),
                formattedEndTime: this.formatTime(endTime),
                formattedDate: this.formatDate(startTime),
                formattedDuration: this.formatDuration(durationMinutes),
                color: this.getColor(s.nextJabatanName),
                lane: 0,
                hasConflict: false,
                conflictCount: 0,
                examinerName: s.examinerName || '-'

            }
        })

        // Sort by start time
        rows.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

        // Calculate lanes using interval packing (same algorithm as Gantt)
        const lanes: { endTime: number }[] = []
        rows.forEach((row) => {
            let placed = false
            for (let i = 0; i < lanes.length; i++) {
                if (row.startTime.getTime() >= lanes[i].endTime) {
                    row.lane = i
                    lanes[i].endTime = row.endTime.getTime()
                    placed = true
                    break
                }
            }
            if (!placed) {
                row.lane = lanes.length
                lanes.push({ endTime: row.endTime.getTime() })
            }
        })

        // Detect conflicts (schedules in different lanes at same time = overlap)
        rows.forEach((row) => {
            const conflicts = rows.filter(
                (other) =>
                    other.participantScheduleId !== row.participantScheduleId &&
                    this.hasOverlap(row, other),
            )
            row.hasConflict = conflicts.length > 0
            row.conflictCount = conflicts.length
        })

        // Calculate summary
        const uniqueDates = new Set(rows.map((r) => r.formattedDate)).size
        const withConflicts = rows.filter((r) => r.hasConflict).length

        this.processedRows$.next(rows)
        this.summary$.next({
            total: rows.length,
            withConflicts,
            uniqueDates,
            totalLanes: lanes.length,
        })
    }

    private hasOverlap(a: ScheduleTableRow, b: ScheduleTableRow): boolean {
        return a.startTime < b.endTime && a.endTime > b.startTime
    }

    private parseDateTime(dateStr: string | null): Date {
        if (!dateStr) {
            return new Date() // Return current date as fallback
        }
        // Handle format "2026-02-06 13:53:00" (space between date and time)
        const normalized = dateStr.replace(' ', 'T')
        return new Date(normalized)
    }

    private getColor(nextjabatanName: string): string {
        return (
            this.colorPalette[nextjabatanName] || this.colorPalette['DEFAULT']
        )
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    private formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} mnt`
        }
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        if (remainingMinutes === 0) {
            return `${hours} jam`
        }
        return `${hours}j ${remainingMinutes}m`
    }
}
