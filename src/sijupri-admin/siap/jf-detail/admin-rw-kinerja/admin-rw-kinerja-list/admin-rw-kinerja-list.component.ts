import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { AlertService } from '@/modules/base/services/alert.service'
import { ApiService } from '@/modules/base/services/api.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { RWKinerja } from '@/modules/siap/models/rw-kinerja.model'
import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../../modules/base/commons/pagable/pagable-builder'

@Component({
    selector: 'app-admin-rw-kinerja-list',
    standalone: true,
    imports: [PagableComponent, CommonModule, FileHandlerComponent],
    templateUrl: './admin-rw-kinerja-list.component.html',
    styleUrl: './admin-rw-kinerja-list.component.scss',
})
export class AdminRwKinerjaListComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_kinerja/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')
    pagable: Pagable
    isDetailOpen: boolean = false
    rwKinerja: RWKinerja = new RWKinerja()

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
                ? '/api/v1/rw_kinerja/search'
                : `/api/v1/rw_kinerja/search?eq_nip=${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tahunan/Bulanan', 'type').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tgl Mulai', 'dateStart').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tgl Selesai', 'dateEnd').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Akumulasi Angka Kredit',
                    'angkaKredit',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwKinerja: any) => {
                        this.getRWKinerja(rwKinerja.id)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        if (this.isAdmin) {
            pagableBuilder.addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwKinerja: any) => {
                        this.handleDeleteRWKinerja(rwKinerja.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
        }

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('type')
                    .withField('Tahunan/Bulanan', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('dateStart')
                    .withField('Tgl Mulai', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('dateEnd')
                    .withField('Tgl Selesai', 'text')
                    .build(),
            )
            .build()
    }

    handleDeleteRWKinerja(id: string): void {
        this.confirmationService
            .open(
                false,
                'Hapus Riwayat Kinerja?',
                'Data riwayat kinerja yang dihapus tidak dapat dikembalikan.',
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
                        .deleteData(`/api/v1/rw_kinerja/${id}`)
                        .subscribe({
                            next: () => {
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Berhasil menghapus riwayat kinerja.',
                                )

                                window.location.reload()
                            },
                            error: () => {
                                this.handlerService.handleAlert(
                                    'Error',
                                    'Gagal menghapus riwayat kinerja.',
                                )
                            },
                        })
                },
            })
    }

    getRWKinerja(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/rw_kinerja/${id}`).subscribe({
            next: (response) => {
                this.rwKinerja = new RWKinerja(response)
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
        this.rwKinerja = new RWKinerja()
    }
}
