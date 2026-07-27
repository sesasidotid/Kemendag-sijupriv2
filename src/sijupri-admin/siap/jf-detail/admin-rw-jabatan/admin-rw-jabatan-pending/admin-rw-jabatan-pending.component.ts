import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { AlertService } from '@/modules/base/services/alert.service'
import { ApiService } from '@/modules/base/services/api.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { RWJabatan } from '@/modules/siap/models/rw-jabatan.model'
import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BehaviorSubject } from 'rxjs'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../../modules/base/commons/pagable/pagable-builder'
import { ObjectTask } from '@/modules/workflow/models/object-task.model'
@Component({
    selector: 'app-admin-rw-jabatan-pending',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        FormsModule,
        FileHandlerComponent,
    ],
    templateUrl: './admin-rw-jabatan-pending.component.html',
    styleUrl: './admin-rw-jabatan-pending.component.scss',
})
export class AdminRwJabatanPendingComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_jabatan/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')
    pendingTask: ObjectTask

    pagable: Pagable
    isDetailOpen: boolean = false
    rwJabatan: RWJabatan = new RWJabatan()

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
        this.apiUrl = `/api/v1/rw_jabatan/task/search/${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Jabatan',
                    'objectTask|object|jabatanName',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Jenjang',
                    'objectTask|object|jenjangName',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Terhitung Mulai',
                    'objectTask|object|tmt',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPendingJabatan: any) => {
                        this.getPendingRWJabatan(rwPendingJabatan.objectTaskId)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('jabatan|name')
                    .withField('Jabatan', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('jenjang|name')
                    .withField('Jenjang', 'text')
                    .build(),
            )
            .build()
    }

    getPendingRWJabatan(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/object_task/${id}`).subscribe({
            next: (response) => {
                const pendingTask = new ObjectTask(response)
                this.rwJabatan = new RWJabatan(pendingTask.object)

                this.loading$.next(false)
            },
            error: (error) => {
                this.loading$.next(false)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pending riwayat jabatan!',
                )
            },
        })
    }

    back() {
        this.isDetailOpen = false
        this.rwJabatan = new RWJabatan()
    }
}
