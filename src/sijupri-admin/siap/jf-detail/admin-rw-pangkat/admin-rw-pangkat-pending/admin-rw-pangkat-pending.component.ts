import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { AlertService } from '@/modules/base/services/alert.service'
import { ApiService } from '@/modules/base/services/api.service'
import { RWPangkat } from '@/modules/siap/models/rw-pangkat.model'
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
import { ObjectTask } from '@/modules/workflow/models/object-task.model'

@Component({
    selector: 'app-admin-rw-pangkat-pending',
    standalone: true,
    imports: [PagableComponent, CommonModule, FileHandlerComponent],
    templateUrl: './admin-rw-pangkat-pending.component.html',
    styleUrl: './admin-rw-pangkat-pending.component.scss',
})
export class AdminRwPangkatPendingComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_pangkat/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')
    pendingTask: ObjectTask

    pagable: Pagable
    isDetailOpen: boolean = false
    rwPangkat: RWPangkat = new RWPangkat()

    loading$ = new BehaviorSubject<boolean>(true)

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.apiUrl = `/api/v1/rw_pangkat/task/search/${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Pangkat', 'objectName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Terhitung Mulai',
                    'objectTask|object|tmt',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPendingPangkat: any) => {
                        this.getPendingRWPangkat(rwPendingPangkat.objectTaskId)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

        this.pagable = pagableBuilder
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('objectName')
                    .withField('Pangkat', 'text')
                    .build(),
            )
            .build()
    }

    getPendingRWPangkat(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/object_task/${id}`).subscribe({
            next: (response) => {
                const pendingTask = new ObjectTask(response)
                this.rwPangkat = new RWPangkat(pendingTask.object)

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

    back() {
        this.isDetailOpen = false
        this.rwPangkat = new RWPangkat()
    }
}
