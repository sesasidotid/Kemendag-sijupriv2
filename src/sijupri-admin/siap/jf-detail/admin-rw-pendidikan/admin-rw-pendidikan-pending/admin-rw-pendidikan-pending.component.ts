import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { AlertService } from '@/modules/base/services/alert.service'
import { ApiService } from '@/modules/base/services/api.service'
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
import { ObjectTask } from '@/modules/workflow/models/object-task.model'

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
    pendingTask: ObjectTask
    pagable: Pagable
    isDetailOpen: boolean = false
    rwPendidikan: RWPendidikan = new RWPendidikan()

    loading$ = new BehaviorSubject<boolean>(true)
    pendidikanListLoading$ = new BehaviorSubject<boolean>(false)
    rwPendingPendidikanLoading$ = new BehaviorSubject<boolean>(false)

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.apiUrl = `/api/v1/rw_pendidikan/task/search/${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Pendidikan',
                    'objectName',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPendingPendidikan: any) => {
                        this.getPendingRWPendidikan(rwPendingPendidikan.objectTaskId)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('objectName')
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
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pendidikan!',
                )
                this.pendidikanListLoading$.next(false)
            },
        })
    }

    getPendingRWPendidikan(id: string) {
        this.rwPendingPendidikanLoading$.next(true)
        this.apiService.getData(`/api/v1/object_task/${id}`).subscribe({
            next: (response) => {
                const pendingTask = new ObjectTask(response)
                this.rwPendidikan = new RWPendidikan(
                    pendingTask.object,
                )

                this.rwPendingPendidikanLoading$.next(false)
            },
            error: (error) => {
                this.rwPendingPendidikanLoading$.next(false)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pending riwayat pendidikan!',
                )
            },
        })
    }

    back() {
        this.isDetailOpen = false
        this.rwPendidikan = new RWPendidikan()
    }
}
