import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { AlertService } from '@/modules/base/services/alert.service'
import { ApiService } from '@/modules/base/services/api.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { RWPendidikan } from '@/modules/siap/models/rw-perndidikan.model'
import { Component, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { PendingTask } from '@/modules/workflow/models/pending-task.model'
import { Pendidikan } from '@/modules/maintenance/models/pendidikan.model'

@Component({
    selector: 'app-admin-rw-pendidikan-pending',
    standalone: true,
    imports: [PagableComponent, CommonModule, FileHandlerComponent],
    templateUrl: './admin-rw-pendidikan-pending.component.html',
    styleUrl: './admin-rw-pendidikan-pending.component.scss',
})
export class AdminRwPendidikanPendingComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_pendidikan/search'
    pendidikanList: Pendidikan[]
    pendingTask: PendingTask
    pagable: Pagable
    isDetailOpen: boolean = false
    rwPendidikan: RWPendidikan = new RWPendidikan()

    loading$ = new BehaviorSubject<boolean>(true)
    pendidikanListLoading$ = new BehaviorSubject<boolean>(false)
    rwPendidikanLoading$ = new BehaviorSubject<boolean>(false)

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
        this.apiUrl = `/api/v1/rw_pendidikan/task/search?eq_nip=${this.nip}`

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
                        this.getPendingRWPendidikan(rwPendidikan.id)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('pendidikan|name')
                    .withField('Pendidikan', 'text')
                    .build(),
            )
            .build()
    }

    getPendidikanList() {
        this.pendidikanListLoading$.next(true)
        this.apiService.getData(`/api/v1/pendidikan`).subscribe({
            next: (response) => {
                this.pendidikanList = response.map(
                    (pendidikan: { [key: string]: any }) =>
                        new Pendidikan(pendidikan),
                )
                this.pendidikanListLoading$.next(false)
            },
            error: (error) => {
                console.log('error', error)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pendidikan!',
                )
                this.pendidikanListLoading$.next(false)
            },
        })
    }

    getPendingRWPendidikan(id: string) {
        this.rwPendidikanLoading$.next(true)
        this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
            next: (response) => {
                const pendingTask = new PendingTask(response)
                this.rwPendidikan = new RWPendidikan(
                    pendingTask.objectTask.object,
                )

                this.rwPendidikanLoading$.next(false)
            },
            error: (error) => {
                this.rwPendidikanLoading$.next(false)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pendidikan!',
                )
            },
        })
    }

    back() {
        this.isDetailOpen = false
        this.rwPendidikan = new RWPendidikan()
    }
}
