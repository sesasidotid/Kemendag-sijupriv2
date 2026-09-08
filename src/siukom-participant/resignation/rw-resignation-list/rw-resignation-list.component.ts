import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, EMPTY, finalize, Observable, tap } from 'rxjs'

@Component({
    selector: 'app-rw-resignation-list',
    standalone: true,
    imports: [PagableComponent, CommonModule],
    templateUrl: './rw-resignation-list.component.html',
    styleUrl: './rw-resignation-list.component.scss',
})
export class RwResignationListComponent {
    apiService = inject(ApiService)
    handlerService = inject(HandlerService)
    userLogin = LoginContext.getUserId()
    participant = signal<Participant | null>(null)
    isLoadingParticipant = signal(true)
    participantNotFound = signal<boolean>(false)

    pagable = signal<Pagable>(null)
    jenisUkomService = inject(JenisUkomService)
    router = inject(Router)
    TanggalWaktuIndo = new TanggalWaktuIndoPipe()

    ngOnInit(): void {
        this.buildParticipantPayload().subscribe({
            next: () => {
                this.initRWResignationPagable()
            },
        })
    }

    buildParticipantPayload(): Observable<any> {
        const userId = this.userLogin

        if (!userId) {
            this.handlerService.handleAlert(
                'Error',
                'Sesi login tidak ditemukan.',
            )
            this.isLoadingParticipant.set(false)

            return EMPTY
        }

        const nip = userId.replace(/^PU-/, '')

        this.isLoadingParticipant.set(true)
        this.participantNotFound.set(false)

        return this.apiService
            .getData(`/api/v1/participant_ukom/nip/${nip}`)
            .pipe(
                tap((res: any) => {
                    const participant = res?.data ?? res

                    this.participant.set(participant)
                }),
                catchError((err) => {
                    if (err?.status === 404) {
                        this.participant.set(null)
                        this.participantNotFound.set(true)

                        return EMPTY
                    }

                    this.handlerService.handleAlert(
                        'Error',
                        err?.error?.message ??
                            'Gagal memuat data peserta UKOM.',
                    )

                    return EMPTY
                }),
                finalize(() => this.isLoadingParticipant.set(false)),
            )
    }

    initRWResignationPagable() {
        const endpoint = `/api/v1/ukom_resignation/search/${this.participant().nip}`

        const resignationPagable = new PagableBuilder(endpoint)
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Jenis Ukom',
                        (data: ParticipantResignation) => {
                            return this.jenisUkomService.getLabelByValue(
                                data.jenisUkom,
                            )
                        },
                    )
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Tanggal Pengajuan',
                        (data: ParticipantResignation) => {
                            const formattedDate =
                                this.TanggalWaktuIndo.transform(data.createdAt)

                            return formattedDate
                        },
                    )
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Tanggal Disetujui',
                        (data: ParticipantResignation) => {
                            const formattedDate =
                                this.TanggalWaktuIndo.transform(
                                    data.lastUpdated,
                                )

                            return formattedDate
                        },
                    )
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: ParticipantResignation) => {
                        this.goToRWResignationUkomDetail(data.id)
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('nip')
                    .withDefaultValue(this.participant()?.nip)
                    .build(),
            )
            .build()

        this.pagable.set(resignationPagable)
    }

    goToRWResignationUkomDetail(resignationId: string) {
        this.router.navigate([`/resignation/detail/${resignationId}`])
    }
}
