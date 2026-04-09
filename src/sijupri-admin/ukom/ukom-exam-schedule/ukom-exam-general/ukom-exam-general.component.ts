import {
    Component,
    computed,
    inject,
    input,
    output,
    signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { AgGridAngular } from 'ag-grid-angular'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { UpdateExaminerModalComponent } from './update-examiner-modal/update-examiner-modal.component'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { UpdateExaminerForParticipantRequest } from '@/modules/ukom/models/exam-schedule/update-examiner-for-participant-request.model'
import { AlertService } from '@/modules/base/services/alert.service'

/**
 * Generic component for displaying exam schedules without time slots
 * Used for: PORTOFOLIO, STUDI_KASUS
 *
 * Features:
 * - Displays participant list with their examiners
 * - Allows changing examiner for each participant
 * - Shows examiner information from examScheduleSupervised array
 */
@Component({
    selector: 'app-ukom-exam-general',
    standalone: true,
    imports: [CommonModule, AgGridAngular, UpdateExaminerModalComponent],
    templateUrl: './ukom-exam-general.component.html',
    styleUrl: './ukom-exam-general.component.scss',
})
export class UkomExamGeneralComponent {
    participantListRefresh = output()

    examDetail = input<ExamSchedule>()
    examinerList = input.required<ExaminerScheduleList[]>()
    participantList = input<ParticipantScheduleList[]>([])

    showExaminerModal = signal<boolean>(false)
    selectedParticipant = signal<ParticipantScheduleList | null>(null)
    examinerMap = computed(() => {
        const map = new Map<string, string>()
        this.examinerList().forEach((examiner) => {
            map.set(examiner.id, examiner.examinerUkom?.user?.name || 'Unknown')
        })
        return map
    })
    participantsWithExaminers = computed(() => {
        const examinerMap = this.examinerMap()
        return this.participantList().map((participant) => {
            const supervisedData = participant.examScheduleSupervised
            const supervisedList = Array.isArray(supervisedData)
                ? supervisedData
                : supervisedData
                  ? [supervisedData]
                  : []

            const examinerNames =
                supervisedList
                    .map((supervised) => {
                        const examinerId = supervised.examinerScheduleId
                        return examinerMap.get(examinerId) || 'Unknown'
                    })
                    .join(', ') || 'Belum ada penguji'

            const examinerIds = supervisedList.map(
                (supervised: any) => supervised.examinerScheduleId,
            )

            return {
                ...participant,
                examinerNamesDisplay: examinerNames,
                examinerIds: examinerIds,
            }
        })
    })
    columnDefs: ColDef[] = [
        {
            headerName: 'No',
            valueGetter: 'node.rowIndex + 1',
            width: 70,
            cellClass: 'text-center',
        },
        {
            headerName: 'Nama Peserta',
            field: 'participantUkom.name',
            flex: 1,
            valueGetter: (params) => {
                return params.data.participantUkom?.name || 'Unknown'
            },
        },
        {
            headerName: 'NIP',
            field: 'participantUkom.nip',
            width: 180,
            valueGetter: (params) => {
                return params.data.participantUkom?.nip || '—'
            },
        },
        {
            headerName: 'Penguji',
            flex: 1,
            valueGetter: (params: any) => {
                const examinerNames = params.data?.examinerNamesDisplay

                if (!examinerNames || examinerNames.length === 0) {
                    return 'Belum ada penguji'
                }

                return examinerNames
            },
            cellRenderer: (params: any) => {
                if (params.value === 'Belum ada penguji') {
                    return '<span class="text-muted">Belum ada penguji</span>'
                }
                return params.value
            },
        },
        {
            headerName: 'Aksi',
            width: 180,
            cellRenderer: () => {
                return `<button class="btn btn-sm btn-info" data-action="update-examiner">
                    <i class="mdi mdi-account-edit me-1"></i>Ubah Penguji
                </button>`
            },
            onCellClicked: (params) => {
                const target = params.event.target as HTMLElement
                const action = target.getAttribute('data-action')

                if (action === 'update-examiner') {
                    this.openExaminerModal(params.data)
                }
            },
        },
    ]
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }
    private examScheduleService = inject(UkomExamScheduleService)
    private alertService = inject(AlertService)
    private gridApi!: GridApi

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    openExaminerModal(participant: ParticipantScheduleList): void {
        this.selectedParticipant.set(participant)
        this.showExaminerModal.set(true)
    }

    closeExaminerModal(): void {
        this.showExaminerModal.set(false)
        this.selectedParticipant.set(null)
    }

    confirmExaminerUpdate(event: {
        participant: ParticipantScheduleList
        examinerIds: string[]
    }): void {
        const { participant, examinerIds } = event

        if (examinerIds.length !== 1) {
            this.alertService.showToast(
                'Warning',
                'Silakan pilih tepat satu penguji',
            )
            return
        }

        const request = new UpdateExaminerForParticipantRequest({
            participantScheduleId: participant.id,
            examinerScheduleIdList: examinerIds,
        })

        this.examScheduleService
            .updateExaminerForParticipantScheduleByParticipantScheduleId(
                request,
            )
            .subscribe({
                next: () => {
                    this.alertService.showToast(
                        'Success',
                        'Penguji berhasil diubah',
                    )

                    this.closeExaminerModal()
                    this.participantListRefresh.emit()
                },
                error: (error) => {
                    console.error('Error updating examiner:', error)
                    this.alertService.showToast(
                        'Error',
                        error?.error?.message ||
                            'Terjadi kesalahan saat mengubah penguji',
                    )
                },
            })
    }
}
