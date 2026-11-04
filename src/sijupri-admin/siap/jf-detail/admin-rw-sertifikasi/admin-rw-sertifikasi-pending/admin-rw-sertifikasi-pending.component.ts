import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { AlertService } from '@/modules/base/services/alert.service'
import { ApiService } from '@/modules/base/services/api.service'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { RWSertifikasi } from '@/modules/siap/models/rw-sertifikasi.model'
import { ObjectTask } from '@/modules/workflow/models/object-task.model'
import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Component({
    selector: 'app-admin-rw-sertifikasi-pending',
    standalone: true,
    imports: [PagableComponent, CommonModule, FileHandlerComponent],
    templateUrl: './admin-rw-sertifikasi-pending.component.html',
    styleUrl: './admin-rw-sertifikasi-pending.component.scss',
})
export class AdminRwSertifikasiPendingComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_pangkat/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')
    pendingTask: ObjectTask

    pagable: Pagable
    isDetailOpen: boolean = false
    rwSertifikasi: RWSertifikasi = new RWSertifikasi()

    loading$ = new BehaviorSubject<boolean>(true)

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
        private filePreviewService: FilePreviewService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.apiUrl = `/api/v1/rw_sertifikasi/task/search/${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'No. SK',
                    'objectTask|object|noSk',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Tgl SK',
                    'objectTask|object|tglSk',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Wilayah Kerja',
                    'objectTask|object|wilayahKerja',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Tgl Mulai',
                    'objectTask|object|dateStart',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Tgl Selesai',
                    'objectTask|object|dateEnd',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'UU Kawalan',
                    'objectTask|object|uuKawalan',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwSertifikasi: any) => {
                        this.getRWSertifikasi(rwSertifikasi.objectTaskId)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('noSk')
                    .withField('No. SK', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('tglSk')
                    .withField('Tgl SK', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('wilayahKerja')
                    .withField('Wilayah Kerja', 'text')
                    .build(),
            )
            .build()
    }

    getRWSertifikasi(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/object_task/${id}`).subscribe({
            next: (response) => {
                const pendingTask = new ObjectTask(response)
                this.rwSertifikasi = new RWSertifikasi(pendingTask.object)

                this.loading$.next(false)
            },
            error: (error) => {
                this.loading$.next(false)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pending riwayat pangkat!',
                )
            },
        })
    }

    preview(fileName: string, fileSource: string) {
        this.filePreviewService.open(fileName, fileSource)
    }

    back() {
        this.isDetailOpen = false
        this.rwSertifikasi = new RWSertifikasi()
    }

    visibility() {
        return () => this.rwSertifikasi.kategoriSertifikasiValue == 2
    }
}
