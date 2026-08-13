import { PrettyNamePipe } from '@/modules/base/pipes/pretty-name.pipe'
import { TanggalIndoPipe } from '@/modules/base/pipes/tanggal-indo.pipe'
import { ApiService } from '@/modules/base/services/api.service'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { PendidikanService } from '@/modules/complement/services/pendidikan-ukom.service'
import { BidangJabatanService } from '@/modules/maintenance/services/bidang-jabatan.service'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { PredikatKinerjaService } from '@/modules/maintenance/services/predikat-kinerja.service'
import { ProvinsiService } from '@/modules/maintenance/services/provinsi.service'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { CommonModule } from '@angular/common'
import { Component, DestroyRef, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { finalize } from 'rxjs'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation' // TODO: sesuaikan path asli

@Component({
    selector: 'app-ukom-resignation-detail',
    standalone: true,
    imports: [CommonModule, TanggalIndoPipe, PrettyNamePipe],
    templateUrl: './ukom-resignation-detail.component.html',
    styleUrl: './ukom-resignation-detail.component.scss',
})
export class UkomResignationDetailComponent {
    ukomResignationId: string | undefined = undefined

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    isLoading = signal(false)

    ukomResignationDetail: ParticipantResignation | undefined = undefined

    private destroyRef = inject(DestroyRef)

    constructor(
        private handlerService: HandlerService,
        private activatedRoute: ActivatedRoute,
        private filePreviewService: FilePreviewService,
        private router: Router,
        public jenisUkomService: JenisUkomService,
        private apiService: ApiService,
        private kabkotaService: KabKotaService,
        public pendidikanService: PendidikanService,
        private bidangJabatanService: BidangJabatanService,
        private provinsiService: ProvinsiService,
        private predikatKinerjaService: PredikatKinerjaService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                this.ukomResignationId = params['id']

                console.log('id:', this.ukomResignationId)

                if (this.ukomResignationId) {
                    this.getDetailUkomResignation()
                }
            })
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }

    back() {
        this.router.navigate(['/ukom/ukom-resignation'], {})
    }

    getDetailUkomResignation(): void {
        if (!this.ukomResignationId) {
            return
        }

        this.isLoading.set(true)

        this.apiService
            .getData(`${RESIGNATION_ENDPOINT}/${this.ukomResignationId}`)
            .pipe(
                finalize(() => this.isLoading.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (res: ParticipantResignation) => {
                    this.ukomResignationDetail = res
                },
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        err?.error?.message ??
                            'Gagal memuat detail pengunduran diri.',
                    )
                },
            })
    }

    assignPendidikanName(pendidikanCode: string) {
        this.pendidikanName =
            this.pendidikanService.getPendidikanById(pendidikanCode)?.name ||
            '-'
    }

    assignBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.bidangJabatanService.findByCode(bidangJabatanCode).subscribe({
            next: (response) => {
                this.bidangJabatanName = response.name ?? null
            },
        })
    }

    assignProvinsiNameByCode(provinsiCode: string) {
        this.provinsiService.findById(provinsiCode).subscribe({
            next: (response) => {
                this.provinsiName = response.name ?? null
            },
        })
    }

    assignKabupatenNameByCode(kabupatenCode: string) {
        this.kabkotaService.findById(kabupatenCode).subscribe({
            next: (response) => {
                this.kabupatenName = response.name ?? null
                this.typeKabKota = response.type ?? null
            },
        })
    }

    assignPredikat1ById(predikatId: string) {
        this.predikatKinerjaService.findById(predikatId).subscribe({
            next: (response) => {
                this.predikat1Name = response.name ?? '-'
            },
        })
    }

    assignPredikat2ById(predikatId: string) {
        this.predikatKinerjaService.findById(predikatId).subscribe({
            next: (response) => {
                this.predikat2Name = response.name ?? '-'
            },
        })
    }
}
