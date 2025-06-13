import { CommonModule } from '@angular/common'
import { LoginContext } from './../../modules/base/commons/login-context'
import { Component, AfterViewInit, ElementRef } from '@angular/core'
import { RoomUkom } from '../../modules/ukom/models/cat/roomukom'
import { ApiService } from '../../modules/base/services/api.service'
import { Router } from '@angular/router'
import { HandlerService } from '../../modules/base/services/handler.service'
import {
    catchError,
    forkJoin,
    interval,
    map,
    Observable,
    of,
    switchMap,
    tap,
    combineLatest,
    finalize
} from 'rxjs'
import { ConfirmationService } from '../../modules/base/services/confirmation.service'
import { CATSchore } from '../../modules/ukom/models/cat/cat-schore'
import { ModalComponent } from '../../modules/base/components/modal/modal.component'
import { BehaviorSubject } from 'rxjs'
import { EmptyStateComponent } from '../../modules/base/components/empty-state/empty-state.component'
import { UkomMakalahComponent } from '../ukom-makalah/ukom-makalah.component'
import { ExamType } from '../../modules/ukom/models/exam-type'
import { MakalahScore } from '../../modules/ukom/models/cat/makalah-score'
import { FilePreviewService } from '../../modules/base/services/file-preview.service'
declare var bootstrap: any

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ModalComponent, EmptyStateComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit {
    roomUkom: RoomUkom = new RoomUkom()
    now: number = Date.now()
    currentDate = new Date()
    participant_id: string = ''
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    groupedKompetensi: any[] = []
    examType: ExamType[] = []
    scoreMap: Record<string, any> = {}

    isRoomLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isExamTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isLoading$: Observable<boolean>

    constructor (
        private apiService: ApiService,
        private router: Router,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private elRef: ElementRef,
        private filePreviewService: FilePreviewService
    ) {
        this.isLoading$ = combineLatest([
            this.isRoomLoading$,
            this.isExamTypeLoading$
        ]).pipe(map(loadings => loadings.some(isLoading => isLoading)))
    }

    ngOnInit () {
        this.getExamType()
            .pipe(switchMap(() => this.getRoomUkom()))
            .subscribe()
        this.updateCurrentTime()
        this.exitFullScreen()
    }

    ngAfterViewInit () {
        this.initializeTooltips()
    }

    getExamType (): Observable<ExamType[]> {
        this.isExamTypeLoading$.next(true)
        return this.apiService.getData('/api/v1/exam_type').pipe(
            map((response: any[]) => response.map(item => new ExamType(item))),
            tap((examTypes: ExamType[]) => {
                this.examType = examTypes
            }),
            catchError(error => {
                console.error('Failed to fetch exam types:', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil jenis ujian'
                )
                return of([])
            }),
            finalize(() => {
                this.isExamTypeLoading$.next(false)
            })
        )
    }

    getAllScores (): Observable<any> {
        if (!this.examType?.length || !this.participant_id) {
            return of([]) // return empty observable if not ready
        }

        const requests = this.examType.map(type => {
            const examCode = type.code
            return this.apiService
                .getData(
                    `/api/v1/exam_grade/${examCode}/${this.participant_id}`
                )
                .pipe(
                    catchError(error => {
                        console.error(
                            `Failed to fetch score for ${examCode}:`,
                            error
                        )
                        return of(null)
                    }),
                    map(response => {
                        let scoreInstance: any
                        switch (examCode) {
                            case 'CAT':
                                scoreInstance = new CATSchore(response)
                                break
                            case 'MAKALAH':
                                scoreInstance = new MakalahScore(response)
                                break
                            default:
                                scoreInstance = response
                        }
                        return { examCode, scoreInstance }
                    })
                )
        })

        return forkJoin(requests).pipe(
            tap(results => {
                results.forEach(result => {
                    if (result && result.examCode) {
                        this.scoreMap[result.examCode] = result.scoreInstance
                    }
                })
            })
        )
    }

    initializeTooltips () {
        const tooltipTriggerList = this.elRef.nativeElement.querySelectorAll(
            '[data-bs-toggle="tooltip"]'
        )
        tooltipTriggerList.forEach((tooltipTriggerEl: any) => {
            new bootstrap.Tooltip(tooltipTriggerEl)
        })
    }

    updateCurrentTime () {
        interval(1000).subscribe(() => {
            this.now = Date.now()
        })
    }

    getAbsoluteUrl (url: string): string {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`
        }
        return url
    }

    exitFullScreen () {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
            /* Firefox */
            ;(document as any).mozCancelFullScreen()
        } else if ((document as any).webkitExitFullscreen) {
            /* Chrome, Safari, and Opera */
            ;(document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
            /* IE/Edge */
            ;(document as any).msExitFullscreen()
        }
    }

    canStartExam (examStartTime: string): boolean {
        return new Date(examStartTime) <= this.currentDate
    }

    getRoomUkom (): Observable<void> {
        const userId = LoginContext.getUserId().replace('PU-', '')

        this.isRoomLoading$.next(true)

        return this.apiService
            .getData(`/api/v1/participant_ukom/nip/${userId}`)
            .pipe(
                tap((response: any) => {
                    this.roomUkom = new RoomUkom(response.roomUkomDto)
                    this.participant_id = response.id
                }),
                switchMap(() => this.getAllScores()),
                finalize(() => {
                    this.isRoomLoading$.next(false)
                }),
                map(() => {})
            )
    }

    startExam (room_ukom_id: string, exam_type_code: string) {
        this.confirmationService.open(false).subscribe({
            next: response => {
                if (!response.confirmed) {
                    return
                }

                this.apiService
                    .postData('/api/v1/exam/start', {
                        examTypeCode: exam_type_code,
                        roomUkomId: room_ukom_id
                    })
                    .subscribe({
                        next: (response: any) => {
                            if (exam_type_code) {
                                this.router.navigate([
                                    `/${exam_type_code.toLowerCase()}`
                                ])
                            }
                        },
                        error: err => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal memulai ujian, silahkan coba lagi'
                            )
                        }
                    })
            }
        })
    }

    toggleModal () {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    viewFile () {
        const answerDto =
            this.scoreMap['MAKALAH']?.questionDtoList[0]?.answerDto

        console.log('Answer DTO:', this.scoreMap['MAKALAH'])
        if (!answerDto) {
            this.handlerService.handleAlert(
                'Error',
                'Tidak ada file yang tersedia untuk ditampilkan.'
            )
            return
        }

        console.log('Opening file:', answerDto)

        this.filePreviewService.open(
            answerDto.answerUpload,
            answerDto.answerUploadUrl
        )
    }

    getGroupedCompetencies (): any[] {
        if (!this.scoreMap['CAT']?.kompetensiIndikatorDtoList) {
            return []
        }

        // Group by kompetensiId
        const grouped = this.scoreMap['CAT'].kompetensiIndikatorDtoList.reduce(
            (acc: any, kompetensi: any) => {
                const key = kompetensi.kompetensiId || 'default'

                if (!acc[key]) {
                    acc[key] = {
                        name: kompetensi.kompetensiName || '-',
                        items: [],
                        total: 0,
                        correct: 0
                    }
                }

                acc[key].items.push(kompetensi)
                acc[key].total += kompetensi.questionDtoList?.length || 0
                acc[key].correct += this.getCorrectAnswersCount(kompetensi)

                return acc
            },
            {}
        )

        return Object.values(grouped).map((group: any) => ({
            ...group,
            percentage:
                group.total > 0
                    ? Math.round((group.correct / group.total) * 100)
                    : 0
        }))
    }

    getCorrectAnswer (question: any): string {
        const correctChoice = question.multipleChoiceDtoList.find(
            (choice: any) => choice.correct
        )
        return correctChoice ? correctChoice.choiceId : ''
    }

    getCompetencyPercentage (kompetensi: any): number {
        if (
            !kompetensi.questionDtoList ||
            kompetensi.questionDtoList.length === 0
        ) {
            return 0
        }

        const correctAnswers = this.getCorrectAnswersCount(kompetensi)
        const totalQuestions = kompetensi.questionDtoList.length

        return Math.round((correctAnswers / totalQuestions) * 100)
    }

    getCorrectAnswersCount (kompetensi: any): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return kompetensi.questionDtoList.filter(
            (question: any) =>
                question.answerDto?.answerChoice ===
                this.getCorrectAnswer(question)
        ).length
    }

    getWrongAnswersCount (kompetensi: any): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return (
            kompetensi.questionDtoList.length -
            this.getCorrectAnswersCount(kompetensi)
        )
    }
}
