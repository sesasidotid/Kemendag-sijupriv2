import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { AlertService } from '@/modules/base/services/alert.service'
import { ApiService } from '@/modules/base/services/api.service'
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
import { ObjectTask } from '@/modules/workflow/models/object-task.model'

@Component({
    selector: 'app-admin-rw-kinerja-pending',
    standalone: true,
    imports: [PagableComponent, CommonModule, FileHandlerComponent],
    templateUrl: './admin-rw-kinerja-pending.component.html',
    styleUrl: './admin-rw-kinerja-pending.component.scss',
})
export class AdminRwKinerjaPendingComponent {
    @Input() nip?: string = ''
    apiUrl: string = '/api/v1/rw_kinerja/search'
    isAdmin = LoginContext.getRoleCodes().includes('ADMIN')
    pagable: Pagable
    isDetailOpen: boolean = false
    rwKinerja: RWKinerja = new RWKinerja()
    pendingTask: ObjectTask

    loading$ = new BehaviorSubject<boolean>(true)

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.apiUrl = `/api/v1/rw_kinerja/task/search/${this.nip}`

        const pagableBuilder = new PagableBuilder(this.apiUrl)
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Tahunan/Bulanan',
                    'objectTask|object|type',
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
                    'Akumulasi Angka Kredit',
                    'objectTask|object|angkaKredit',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwPendingKinerja: any) => {
                        this.getPendingRWKinerja(rwPendingKinerja.objectTaskId)
                        this.isDetailOpen = true
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )

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

    getPendingRWKinerja(id: string) {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/object_task/${id}`).subscribe({
            next: (response) => {
                const pendingTask = new ObjectTask(response)
                this.rwKinerja = new RWKinerja(pendingTask.object)

                this.loading$.next(false)
            },
            error: (error) => {
                this.loading$.next(false)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data pending riwayat kinerja!',
                )
            },
        })
    }

    back() {
        this.isDetailOpen = false
        this.rwKinerja = new RWKinerja()
    }
}
