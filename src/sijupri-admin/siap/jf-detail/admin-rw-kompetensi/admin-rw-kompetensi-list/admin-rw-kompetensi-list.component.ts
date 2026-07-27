import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { ApiService } from '@/modules/base/services/api.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { RWKompetensi } from '@/modules/siap/models/rw-kompetensi.model'
import { RwKompetensiService } from '@/modules/siap/services/rw-kompetensi.service'
import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../../modules/base/commons/pagable/pagable-builder'
import { AlertService } from '@/modules/base/services/alert.service'

@Component({
    selector: 'app-admin-rw-kompetensi-list',
    standalone: true,
    imports: [CommonModule, FileHandlerComponent, PagableComponent],
    templateUrl: './admin-rw-kompetensi-list.component.html',
    styleUrl: './admin-rw-kompetensi-list.component.scss',
})
export class AdminRwKompetensiListComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_kompetensi/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')

    pagable: Pagable
    isDetailOpen: boolean = false
    rwKompetensi: RWKompetensi

    loading$ = new BehaviorSubject<boolean>(true)

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.apiUrl =
            this.nip === ''
                ? '/api/v1/rw_kompetensi/search'
                : `/api/v1/rw_kompetensi/search?eq_nip=${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tgl Mulai', 'tglSertifikat').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tgl Selesai', 'dateEnd').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Tgl Sertifikat',
                    'tglSertifikat',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwKompetensi: any) => {
                        this.getRWKompetensi(rwKompetensi.id)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        if (this.isAdmin) {
            pagableBuilder.addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwKompetensi: any) => {
                        this.handleDeleteRWKompetensi(rwKompetensi.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
        }

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('tglSertifikat')
                    .withField('Tgl Sertifikat', 'text')
                    .build(),
            )
            .build()
    }

    handleDeleteRWKompetensi(id: string): void {
        this.confirmationService
            .open(
                false,
                'Hapus Riwayat Kompoetensi?',
                'Data riwayat kompetensi yang dihapus tidak dapat dikembalikan.',
                undefined,
                'Ya, Hapus',
                'Batal',
            )
            .subscribe({
                next: (res) => {
                    if (!res.confirmed) {
                        return
                    }

                    this.apiService
                        .deleteData(`/api/v1/rw_kompetensi/${id}`)
                        .subscribe({
                            next: () => {
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Berhasil menghapus riwayat kompetensi.',
                                )

                                window.location.reload()
                            },
                            error: () => {
                                this.handlerService.handleAlert(
                                    'Error',
                                    'Gagal menghapus riwayat kompetensi.',
                                )
                            },
                        })
                },
            })
    }

    getRWKompetensi(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/rw_kompetensi/${id}`).subscribe({
            next: (response) => {
                this.rwKompetensi = new RWKompetensi(response)
                this.loading$.next(false)
            },
            error: (error) => {
                console.log('error', error)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data riwayat',
                )
                this.loading$.next(false)
            },
        })
    }

    back() {
        this.isDetailOpen = false
        this.rwKompetensi = new RWKompetensi()
    }
}
