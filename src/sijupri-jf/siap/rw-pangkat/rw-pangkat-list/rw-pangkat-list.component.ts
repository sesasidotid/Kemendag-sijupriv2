import { Component, Input } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { RWPangkat } from '../../../../modules/siap/models/rw-pangkat.model'
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
    selector: 'app-rw-pangkat-list',
    standalone: true,
    imports: [PagableComponent, CommonModule, FileHandlerComponent],
    templateUrl: './rw-pangkat-list.component.html',
    styleUrl: './rw-pangkat-list.component.scss',
})
export class RwPangkatListComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_pangkat/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')

    pagable: Pagable
    isDetailOpen: boolean = false
    rwPangkat: RWPangkat = new RWPangkat()

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
                ? '/api/v1/rw_pangkat/search'
                : `/api/v1/rw_pangkat/search?eq_nip=${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Pangkat', 'pangkat|name').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Terhitung Mulai', 'tmt').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPangkat: any) => {
                        this.getRWPangkat(rwPangkat.id)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        if (this.isAdmin) {
            pagableBuilder.addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPangkat: any) => {
                        this.handleDeleteRWPangkat(rwPangkat.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
        }

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('pangkat|name')
                    .withField('Pangkat', 'text')
                    .build(),
            )
            .build()
    }
    
    handleDeleteRWPangkat(id: string): void {
        this.confirmationService
            .open(
                false,
                'Hapus Riwayat Pangkat?',
                'Data riwayat pangkat yang dihapus tidak dapat dikembalikan.',
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
                        .deleteData(`/api/v1/rw_pangkat/${id}`)
                        .subscribe({
                            next: () => {
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Berhasil menghapus riwayat pangkat.',
                                )

                                window.location.reload()
                            },
                            error: () => {
                                this.handlerService.handleAlert(
                                    'Error',
                                    'Gagal menghapus riwayat pangkat.',
                                )
                            },
                        })
                },
            })
    }

    getRWPangkat(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/rw_pangkat/${id}`).subscribe({
            next: (response) => {
                this.rwPangkat = new RWPangkat(response)
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
        this.rwPangkat = new RWPangkat()
    }
}
