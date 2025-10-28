import { Component } from '@angular/core'
import { catchError, combineLatest, map, Observable, of } from 'rxjs'
import { PendidikanService } from '@/modules/complement/services/pendidikan-ukom.service'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { BidangJabatanService } from '@/modules/maintenance/services/bidang-jabatan.service'
import { ActivatedRoute, Router } from '@angular/router'
import { UkomPendingTaskService } from '@/modules/ukom/services/ukom-pending-task.service'
import {
    ParticipantObject,
    PendingTask,
} from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'
import { TanggalIndoPipe } from '@/modules/base/pipes/tanggal-indo.pipe'
import { CommonModule } from '@angular/common'
import { AgeCalculatorPipe } from '@/modules/base/pipes/age-calculator.pipe'
import { PrettyNamePipe } from '@/modules/base/pipes/pretty-name.pipe'
import { DataDokumenUkom } from '@/modules/ukom/models/data-dukung'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { DokumenUkom } from '@/modules/ukom/models/ukom-registration-refactored/document.model'

@Component({
    selector: 'app-ukom-task-detail-failed',
    standalone: true,
    imports: [
        TanggalIndoPipe,
        CommonModule,
        AgeCalculatorPipe,
        PrettyNamePipe,
        FileHandlerComponent,
    ],
    templateUrl: './ukom-task-detail-failed.component.html',
    styleUrl: './ukom-task-detail-failed.component.scss',
})
export class UkomTaskDetailFailedComponent {
    isLoading$: Observable<boolean>
    pesertaUkom: ParticipantObject

    kabKotaName: string | undefined
    pendidikanName: string | undefined
    bidangJabatanName: string | undefined
    jenisUkomName: string | undefined

    fileHandlerData: FIleHandler = {
        files: {},
        viewOnly: true,
    }
    constructor(
        public kinerjaService: KinerjaService,
        public jenisUkomService: JenisUkomService,
        public pendidikanService: PendidikanService,
        private kabKotaService: KabKotaService,
        public bidangJabatanService: BidangJabatanService,
        private activatedRoute: ActivatedRoute,
        public ukomPendingTaskService: UkomPendingTaskService,
        private router: Router,
    ) {
        this.isLoading$ = combineLatest([true]).pipe(
            map((loadings) => loadings.some((isLoading) => isLoading)),
        )
    }

    ngOnInit() {
        this.kinerjaService.fetchPredikatKinerja()
        this.pendidikanService.fetchPendidikan()
        this.activatedRoute.params.subscribe((params) => {
            this.ukomPendingTaskService.findById(params['id'])
        })

        this.ukomPendingTaskService.pendingTaskDetail$.subscribe((p) => {
            if (p) {
                this.pesertaUkom = p.objectTask.object

                this.pendidikanName = this.pendidikanService.getPendidikanById(
                    p.objectTask.object.pendidikanTerakhirCode,
                )?.name

                this.getBidangJabatanName(p.objectTask.object.bidangJabatanCode)
                this.jenisUkomName = this.jenisUkomService.getLabelByValue(
                    p.objectTask.object.jenisUkom,
                )
                this.mapDokumenUkom(p.objectTask.object.dokumenUkomList)
            }
        })
    }

    getKabupatenNameByCode(kabupatenCode: string | null | undefined) {
        if (!kabupatenCode) return

        this.kabKotaService
            .findById(kabupatenCode)
            .pipe(
                catchError(() => {
                    return of({ name: '-', type: '' })
                }),
            )
            .subscribe({
                next: (res) => {
                    this.kabKotaName = res.type + '' + res.name
                },
            })
    }

    getBidangJabatanName(bidangJabatanCode: string | null | undefined) {
        if (!bidangJabatanCode) return

        this.bidangJabatanService.findByCode(bidangJabatanCode).subscribe({
            next: (res) => {
                this.bidangJabatanName = res.name
            },
        })
    }

    mapDokumenUkom(doc: DokumenUkom[]) {
        this.fileHandlerData.files = {}
        doc.forEach((doc, index) => {
            this.fileHandlerData.files[`file${index}`] = {
                label: doc.dokumenPersyaratanName,
                source: doc.dokumenUrl,
                id: doc.id,
                required: false,
            }
        })
    }

    get hasFiles(): boolean {
        return Object.keys(this.fileHandlerData.files || {}).length > 0
    }

    back() {
        this.router.navigate(['/ukom/ukom-list'])
    }
}
