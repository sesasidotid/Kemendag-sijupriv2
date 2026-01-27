import {
    Component,
    computed,
    effect,
    inject,
    input,
    output,
    signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { UkomRoomService } from '@/modules/ukom/services/ukom-room.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { Participant } from '@/modules/ukom/models/cat/participant.model'

@Component({
    selector: 'app-exam-assessment-layout',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './exam-assessment-layout.component.html',
    styleUrl: './exam-assessment-layout.component.scss',
})
export class ExamAssessmentLayoutComponent {
    loading = input<boolean>(false)
    loadingMessage = input<string>('Memuat form penilaian...')
    showSavedIndicator = input<boolean>(false)
    savedMessage = input<string>('Jawaban telah disimpan')
    showBackButton = input<boolean>(true)

    // IDs to fetch data
    examScheduleId = input<string>('')
    participantId = input<string>('')

    backClicked = output<void>()
    // Internal signals for storing fetched data
    examScheduleDetail = signal<ExamSchedule | null>(null)
    roomDetail = signal<RoomUkomDetail | null>(null)
    participantDetail = signal<Participant | null>(null)
    // Computed values for template
    participantName = computed(() => this.participantDetail()?.name ?? '')
    participantNip = computed(() => this.participantDetail()?.nip ?? '')
    zoomLink = computed(() => this.roomDetail()?.vidCallLink ?? '')
    private examScheduleService = inject(UkomExamScheduleService)
    private roomService = inject(UkomRoomService)
    private participantService = inject(UkomParticipantService)

    constructor() {
        // Fetch exam schedule when examScheduleId changes
        effect(() => {
            const examScheduleId = this.examScheduleId()
            if (examScheduleId) {
                this.examScheduleService
                    .getExamScheduleDetailById(examScheduleId)
                    .subscribe({
                        next: (res) => {
                            this.examScheduleDetail.set(res)
                        },
                    })
            }
        })

        // Fetch room details when roomUkomId is available
        effect(() => {
            const roomId = this.examScheduleDetail()?.roomUkomId
            if (roomId) {
                this.roomService.getRoomDetailByRoomId(roomId).subscribe({
                    next: (res) => {
                        this.roomDetail.set(res)
                    },
                })
            }
        })

        // Fetch participant details when participantId changes
        effect(() => {
            const participantId = this.participantId()
            if (participantId) {
                this.participantService
                    .getParticipantByParticipantId(participantId)
                    .subscribe({
                        next: (res) => {
                            this.participantDetail.set(res)
                        },
                    })
            }
        })
    }

    onBackClick(): void {
        this.backClicked.emit()
    }

    getZoomUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }

        return `https://${url}`
    }

    copyToClipboard(text: string, type: string): void {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`${type} copied to clipboard`)
        })
    }
}
