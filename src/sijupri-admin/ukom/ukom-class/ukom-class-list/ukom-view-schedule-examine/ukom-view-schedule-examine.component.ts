import { Component, inject, OnInit, signal } from '@angular/core'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { ExamScheduleCalendar } from '@/modules/ukom/models/exam-schedule/exam-schedule-calendar.model'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-ukom-view-schedule-examine',
    standalone: true,
    imports: [PagableComponent, CommonModule, ReactiveFormsModule],
    templateUrl: './ukom-view-schedule-examine.component.html',
    styleUrl: './ukom-view-schedule-examine.component.scss',
})
export class UkomViewScheduleExamineComponent implements OnInit {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    pagable = signal<Pagable>(null)
    hasLoadedSchedules = signal(false)
    dateRangeForm: FormGroup

    tanggalWaktuPipe = new TanggalWaktuIndoPipe()

    constructor() {
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        this.dateRangeForm = new FormGroup({
            startDate: new FormControl(this.formatDate(firstDay), [
                Validators.required,
            ]),
            endDate: new FormControl(this.formatDate(lastDay), [
                Validators.required,
            ]),
            status: new FormControl('ungraded', [Validators.required]),
        })
    }

    ngOnInit() {
        // Form initialized in constructor
    }

    loadSchedules() {
        if (this.dateRangeForm.invalid) return

        const { startDate, endDate, status } = this.dateRangeForm.value
        this.initPagable(startDate, endDate, status)
        this.hasLoadedSchedules.set(true)
    }

    // TODO: update the endpoint to use query params to filter only unexamined record are returned.
    initPagable(startDate: string, endDate: string, status: string) {
        let url = `/api/v1/exam_schedule/calendar?startDate=${startDate}&endDate=${endDate}`
        if (status === 'ungraded') {
            url += '&is_graded=false'
        } else if (status === 'graded') {
            url += '&is_graded=true'
        }

        this.pagable.set(
            new PagableBuilder(url)
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Kelas',
                        'examSchedule|roomUkom|name',
                    )
                        .withTitle(
                            (data: ExamScheduleCalendar) =>
                                data.examSchedule.roomUkom.name,
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Jenis UKom',
                            (data: ExamScheduleCalendar) =>
                                this.ukomMiscellaneousService.getModuleDisplayName(
                                    data.examSchedule.examTypeCode,
                                ),
                        )
                        .build(),
                )
                // .addPrimaryColumn(
                //     new PrimaryColumnBuilder(
                //         'Jenis Ukom',
                //         'examSchedule|examTypeCode',
                //     ).build(),
                // )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Waktu Mulai',
                            (data: ExamScheduleCalendar) =>
                                this.tanggalWaktuPipe.transform(
                                    data.examSchedule.startTime,
                                ),
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Waktu selesai',
                            (data: ExamScheduleCalendar) =>
                                this.tanggalWaktuPipe.transform(
                                    data.examSchedule.endTime,
                                ),
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'NIP Peserta',
                        'participantUkom|nip',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Nama Peserta',
                        'participantUkom|name',
                    )
                        .withTitle(
                            (data: ExamScheduleCalendar) =>
                                data.participantUkom.name,
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Nama Penguji',
                        'examScheduleSupervised|examinerSchedule|examinerUkom|user|name',
                    )
                        .withTitle(
                            (data: ExamScheduleCalendar) =>
                                data.examScheduleSupervised?.examinerSchedule
                                    ?.examinerUkom?.user?.name,
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Penguji Sudah Menilai?',
                            (data: ExamScheduleCalendar) => {
                                if (this.hasExaminerEvaluated(data)) {
                                    return 'Sudah'
                                }

                                return 'Belum'
                            },
                        )
                        .withCellClass((data: ExamScheduleCalendar) => {
                            if (this.hasExaminerEvaluated(data)) {
                                return 'bg-success text-white fw-bold'
                            }

                            return 'bg-danger text-white fw-bold'
                        })
                        .build(),
                )
                .addExclusion('Jenis Ukom', 'CAT')
                .build(),
        )
    }

    hasExaminerEvaluated(data: ExamScheduleCalendar): boolean {
        return Boolean(data.examined)
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
}
