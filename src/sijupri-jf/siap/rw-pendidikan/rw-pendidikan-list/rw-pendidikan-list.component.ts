import { Component, Input } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { RWPendidikan } from '../../../../modules/siap/models/rw-perndidikan.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { BehaviorSubject } from 'rxjs'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoginContext } from '@/modules/base/commons/login-context'

@Component({
    selector: 'app-rw-pendidikan-list',
    standalone: true,
    imports: [PagableComponent, CommonModule, FileHandlerComponent],
    templateUrl: './rw-pendidikan-list.component.html',
    styleUrl: './rw-pendidikan-list.component.scss',
})
export class RwPendidikanListComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_pendidikan/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')

    pagable: Pagable
    isDetailOpen: boolean = false
    rwPendidikan: RWPendidikan = new RWPendidikan()

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
                ? '/api/v1/rw_pendidikan/search'
                : `/api/v1/rw_pendidikan/search?eq_nip=${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Pendidikan',
                    'pendidikan|name',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPendidikan: any) => {
                        this.getRWPendidikan(rwPendidikan.id)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        if (this.isAdmin) {
            pagableBuilder.addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPendidikan: any) => {
                        this.handleDeleteRWPendidikan(rwPendidikan.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
        }

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('pendidikan|name')
                    .withField('Pendidikan', 'text')
                    .build(),
            )
            .build()
    }

    handleDeleteRWPendidikan(id: string): void {
        this.confirmationService
            .open(
                false,
                'Hapus Riwayat Pendidikan?',
                'Data riwayat pendidikan yang dihapus tidak dapat dikembalikan.',
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
                        .deleteData(`/api/v1/rw_pendidikan/${id}`)
                        .subscribe({
                            next: () => {
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Berhasil menghapus riwayat pendidikan.',
                                )

                                // window.location.reload()
                            },
                            error: () => {
                                this.handlerService.handleAlert(
                                    'Error',
                                    'Gagal menghapus riwayat pendidikan.',
                                )
                            },
                        })
                },
            })
    }

    getRWPendidikan(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/rw_pendidikan/${id}`).subscribe({
            next: (response) => {
                this.rwPendidikan = new RWPendidikan(response)
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
        this.rwPendidikan = new RWPendidikan()
    }
}
