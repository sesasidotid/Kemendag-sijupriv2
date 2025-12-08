import { ConfirmationService } from './../../../../modules/base/services/confirmation.service'
import { Component, inject, signal } from '@angular/core'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { ActivatedRoute, Router } from '@angular/router'
import { JF } from '../../../../modules/siap/models/jf.model'
import { BehaviorSubject, finalize, map, Observable } from 'rxjs'
import { CommonModule, Location } from '@angular/common'
import { ApiService } from '../../../../modules/base/services/api.service'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { FilePreviewService } from '../../../../modules/base/services/file-preview.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { TanggalIndoPipe } from '../../../../modules/base/pipes/tanggal-indo.pipe'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { ParticipantHistoryTask } from '@/modules/ukom/models/ukom-module-refactor/participant-history-task.model'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { JfService } from '@/modules/siap/services/jf.service'
@Component({
    selector: 'app-ukom-detail',
    standalone: true,
    imports: [PagableComponent, CommonModule, TanggalIndoPipe],
    templateUrl: './ukom-detail.component.html',
    styleUrl: './ukom-detail.component.scss',
})
export class UkomDetailComponent {
    participantService = inject(UkomParticipantService)
    jfService = inject(JfService)
    router = inject(Router)
    location = inject(Location)

    jfLoading = signal(false)
    pagable: Pagable
    jf = new JF()

    isBanned: boolean
    bannedDue: string = ''
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    predikatKinerjaList: any[] = []
    refresh: boolean

    isModalOpen$ = new BehaviorSubject<boolean>(false)

    constructor(
        private activatedRoute: ActivatedRoute,
        private apiService: ApiService,
        private sanitizer: DomSanitizer,
        private filePreviewService: FilePreviewService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private jenisUkomService: JenisUkomService,
    ) {}

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((params) => {
            const id = params.get('id')
            if (!id) return

            this.handlePagable(id)

            this.isUserBanned(id).subscribe((result) => {
                this.isBanned = result.banned
                this.bannedDue = result.until

                if (result.isJF) {
                    this.getJF(id)
                }
            })
        })
    }

    handlePagable(id: string) {
        this.pagable = new PagableBuilder(`/api/v1/participant_ukom/all/${id}`)
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Jenis Ukom',
                        (data: ParticipantHistoryTask) => {
                            return this.jenisUkomService.getLabelByValue(
                                data.jenisUkom,
                            )
                        },
                    )
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tanggal', 'dateCreated').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: ParticipantHistoryTask) => {
                        this.router.navigate([
                            `/ukom/ukom-list/${ukom.nip}/${ukom.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: ParticipantHistoryTask) => {
                        this.handleDeleteTask(ukom.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()
    }

    handleDeleteTask(id: string) {
        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.participantService.deleteTaskById(id).subscribe({
                    next: () => {
                        this.handlerService.handleAlert(
                            'Success',
                            'Data berhasil dihapus',
                        )
                        this.refresh = !this.refresh
                    },
                    error: () => {
                        this.handlerService.handleAlert(
                            'Error',
                            'Data gagal dihapus',
                        )
                    },
                })
            },
        })
    }

    preview(fileName: string, fileSource: string) {
        this.filePreviewService.open(fileName, fileSource)
    }

    getJF(id: string) {
        this.jfLoading.set(true)

        this.jfService
            .findByNip(id)
            .pipe(finalize(() => this.jfLoading.set(false)))
            .subscribe({
                next: (jf) => {
                    this.jf = jf
                },
            })
    }

    fetchPhotoProfile() {
        this.apiService.getPhotoProfile(LoginContext.getUserId()).subscribe({
            next: (blob) => {
                if (blob.size === 0) {
                    this.profileImageSrc = 'assets/no-profile.jpg'
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                this.profileImageSrc =
                    this.sanitizer.bypassSecurityTrustUrl(objectUrl)
            },
        })
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
    }

    isUserBanned(
        id: string,
    ): Observable<{ isJF: boolean; banned: boolean; until?: string }> {
        return this.participantService.searchTask(1, 1, { eq_nip: id }).pipe(
            map((response) => {
                const data = response.data[0]
                const isJf = data.participantStatus == 'jf'
                return {
                    isJF: isJf,
                    banned: data.ukomBan != null,
                    until: data.ukomBan?.until,
                }
            }),
        )
    }
}
