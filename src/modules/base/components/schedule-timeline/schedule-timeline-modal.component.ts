import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import {
    ScheduleItem,
    ScheduleTimelineComponent,
} from './schedule-timeline.component'
import { ScheduleTimelineTableComponent } from './schedule-timeline-table.component'
import * as XLSX from 'xlsx'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'

type ViewMode = 'gantt' | 'table'

@Component({
    selector: 'app-schedule-timeline-modal',
    standalone: true,
    imports: [
        CommonModule,
        ScheduleTimelineComponent,
        ScheduleTimelineTableComponent,
    ],
    template: `
        <div class="timeline-modal-container">
            <!-- View Toggle -->
            <div class="view-toggle-section">
                <div class="btn-group" role="group">
                    <button
                        type="button"
                        class="btn"
                        [class.btn-primary]="(viewMode$ | async) === 'table'"
                        [class.btn-outline-primary]="
                            (viewMode$ | async) !== 'table'
                        "
                        (click)="setViewMode('table')"
                    >
                        <i class="ri-table-line me-1"></i>
                        Tabel
                    </button>
                    <button
                        type="button"
                        class="btn"
                        [class.btn-primary]="(viewMode$ | async) === 'gantt'"
                        [class.btn-outline-primary]="
                            (viewMode$ | async) !== 'gantt'
                        "
                        (click)="setViewMode('gantt')"
                    >
                        <i class="ri-bar-chart-horizontal-line me-1"></i>
                        Gantt Chart
                    </button>
                </div>

                <!-- Export Button -->
                <button
                    type="button"
                    class="btn btn-success ms-3"
                    (click)="exportToExcel()"
                    [disabled]="!schedules || schedules.length === 0"
                >
                    <i class="ri-file-excel-2-line me-1"></i>
                    Export Excel
                </button>
            </div>

            <!-- Gantt View -->
            <div *ngIf="(viewMode$ | async) === 'gantt'" class="view-content">
                <app-schedule-timeline
                    [schedules]="schedules"
                    (closeTimeline)="close()"
                ></app-schedule-timeline>
            </div>

            <!-- Table View -->
            <div *ngIf="(viewMode$ | async) === 'table'" class="view-content">
                <app-schedule-timeline-table
                    [schedules]="schedules"
                    (closeTimeline)="close()"
                ></app-schedule-timeline-table>
            </div>
        </div>
    `,
    styles: [
        `
            .timeline-modal-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                min-height: 500px;
            }

            .view-toggle-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0px;
                background-color: #fff;
                //border-bottom: 1px solid #dee2e6;
                flex-shrink: 0;
            }

            .view-content {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;

                app-schedule-timeline,
                app-schedule-timeline-table {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleTimelineModalComponent implements OnInit {
    @Input() schedules: ScheduleItem[] = []
    @Input() defaultView: ViewMode = 'table'
    @Output() closeTimeline = new EventEmitter<void>()

    viewMode$ = new BehaviorSubject<ViewMode>('table')

    ukomMiscellaneousService = inject(UkomMiscellaneousService)

    ngOnInit(): void {
        this.viewMode$.next(this.defaultView)
    }

    setViewMode(mode: ViewMode): void {
        this.viewMode$.next(mode)
    }

    exportToExcel(): void {
        if (!this.schedules || this.schedules.length === 0) {
            return
        }

        // Prepare data for export
        const exportData = this.schedules.map((schedule, index) => {
            // Handle format "2026-02-06 13:53:00" (space between date and time)
            const startTime = new Date(
                schedule.personalSchedule.replace(' ', 'T'),
            )
            const endTime = new Date(
                startTime.getTime() + schedule.duration * 60 * 60 * 1000,
            )

            return {
                No: index + 1,
                'Nama Peserta': schedule.name,
                NIP: schedule.nip || '-',
                Tanggal: this.formatDate(startTime),
                'Waktu Mulai': this.formatTime(startTime),
                'Waktu Selesai': this.formatTime(endTime),
                Durasi: this.formatDuration(schedule.duration * 60),
                'Jabatan yang Dituju': schedule.nextJabatanName || '-',
                'Jenjang yang Dituju': schedule.nextJenjangName || '-',
                'Jenis Ujian': schedule.jenisUjian,
                'Jenis Ukom': schedule.jenisUkom,
                'Unit Kerja': schedule.unitKerjaName || '-',
                Email: schedule.email || '-',
                'No. Telepon': schedule.phone || '-',
            }
        })

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData)

        // Set column widths
        worksheet['!cols'] = [
            { wch: 5 }, // No
            { wch: 25 }, // Nama Peserta
            { wch: 20 }, // NIP
            { wch: 15 }, // Tanggal
            { wch: 12 }, // Waktu Mulai
            { wch: 12 }, // Waktu Selesai
            { wch: 12 }, // Durasi
            { wch: 20 }, // NextJabatan
            { wch: 15 }, // NextJenjang
            { wch: 20 }, // Jenis Ukom
            { wch: 25 }, // Unit Kerja
            { wch: 25 }, // Email
            { wch: 15 }, // No. Telepon
        ]

        // Create workbook and add the worksheet
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Ujian')

        // Generate filename with current date
        const fileName = `Jadwal-Ujian-${new Date().toISOString().split('T')[0]}.xlsx`

        // Save file
        XLSX.writeFile(workbook, fileName)
    }

    close(): void {
        this.closeTimeline.emit()
    }

    private formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    private formatDuration(minutes: number): string {
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
}
