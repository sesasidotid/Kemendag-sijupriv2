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

@Component({
    selector: 'app-ukom-view-schedule-examine',
    standalone: true,
    imports: [PagableComponent],
    templateUrl: './ukom-view-schedule-examine.component.html',
    styleUrl: './ukom-view-schedule-examine.component.scss',
})
export class UkomViewScheduleExamineComponent implements OnInit {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    pagable = signal<Pagable>(null)

    tanggalWaktuPipe = new TanggalWaktuIndoPipe()

    ngOnInit() {
        this.initPagable()
    }

    // TODO: update the endpoint to use query params to filter only unexamined record are returned.
    initPagable() {
        this.pagable.set(
            new PagableBuilder(
                '/api/v1/exam_schedule/calendar?is_graded=false&startDate=2026-05-08&endDate=2026-05-08',
            )
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
                .build(),
        )
    }

    hasExaminerEvaluated(data: ExamScheduleCalendar): boolean {
        return Boolean(data.examined)
    }
}
