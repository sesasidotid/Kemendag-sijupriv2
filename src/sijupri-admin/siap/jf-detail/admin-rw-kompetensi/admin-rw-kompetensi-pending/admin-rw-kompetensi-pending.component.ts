import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { ApiService } from '@/modules/base/services/api.service'
import { RWKompetensi } from '@/modules/siap/models/rw-kompetensi.model'
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
import { ObjectTask } from '@/modules/workflow/models/object-task.model'

@Component({
    selector: 'app-admin-rw-kompetensi-pending',
    standalone: true,
    imports: [CommonModule, FileHandlerComponent, PagableComponent],
    templateUrl: './admin-rw-kompetensi-pending.component.html',
    styleUrl: './admin-rw-kompetensi-pending.component.scss',
})
export class AdminRwKompetensiPendingComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_kompetensi/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')
    pendingTask: ObjectTask
    pagable: Pagable
    isDetailOpen: boolean = false
    rwKompetensi: RWKompetensi

    loading$ = new BehaviorSubject<boolean>(true)

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.apiUrl = `/api/v1/rw_kompetensi/task/search/${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
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
                    'Tgl Sertifikat',
                    'objectTask|object|tglSertifikat',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPendingKompetensi: any) => {
                        this.getPendingRWKompetensi(
                            rwPendingKompetensi.objectTaskId,
                        )
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('tglSertifikat')
                    .withField('Tgl Sertifikat', 'text')
                    .build(),
            )
            .build()
    }

    getPendingRWKompetensi(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/object_task/${id}`).subscribe({
            next: (response) => {
                const pendingTask = new ObjectTask(response)
                this.rwKompetensi = new RWKompetensi(pendingTask.object)

                this.loading$.next(false)
            },
            error: (error) => {
                this.loading$.next(false)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pending riwayat kompetensi!',
                )
            },
        })
    }

    back() {
        this.isDetailOpen = false
        this.rwKompetensi = new RWKompetensi()
    }
}
