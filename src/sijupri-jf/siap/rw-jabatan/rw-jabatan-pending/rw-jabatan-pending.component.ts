import { Component } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { RWJabatan } from '../../../../modules/siap/models/rw-jabatan.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model'
import { Task } from '../../../../modules/workflow/models/task.model'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { CommonModule } from '@angular/common'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { fileValidator } from '../../../../modules/base/validators/file-format.validator'
import { BehaviorSubject } from 'rxjs'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'
import { PendingTaskService } from '../../../../modules/workflow/services/pending-task.service'

@Component({
    selector: 'app-rw-jabatan-pending',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        ReactiveFormsModule
    ],
    templateUrl: './rw-jabatan-pending.component.html',
    styleUrl: './rw-jabatan-pending.component.scss'
})
export class RwJabatanPendingComponent {
    pagable: Pagable
    refresh: boolean = false
    isDetailOpen: boolean = false
    rwJabatan: RWJabatan = new RWJabatan()
    jabatanList: Jabatan[]
    jenjangList: Jenjang[]
    pendingTask: PendingTask

    jenjangLoading$ = new BehaviorSubject<boolean>(false)
    rwJabatanLoading$ = new BehaviorSubject<boolean>(false)
    submitLoading$ = new BehaviorSubject<boolean>(false)
    jabatanListLoading$ = new BehaviorSubject<boolean>(false)
    rwJabatanForm!: FormGroup

    inputs: FIleHandler

    constructor (
        private apiService: ApiService,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
        private pendingTaskService: PendingTaskService
    ) {}

    ngOnInit () {
        this.handlePagable()
        this.handleFormInit()
        this.handleSubscribe()
    }

    handlePagable () {
        this.pagable = new PagableBuilder('/api/v1/rw_jabatan/task/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tanggal', 'dateCreated').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Jabatan | Jenjang',
                    'objectName'
                ).build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'flowName').build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((pendingTask: PendingTask) => {
                        this.pendingTask = pendingTask
                        if (pendingTask.flowId == 'siap_flow_2') {
                            this.getPendingRWJabatan(this.pendingTask.id)
                            this.getJabatanList()
                            this.isDetailOpen = true
                        }
                    }, 'info')
                    .addInactiveCondition(
                        (pendingTask: PendingTask) =>
                            pendingTask.flowId == 'siap_flow_1'
                    )
                    .withIcon('update')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((pendingTask: PendingTask) => {
                        this.deletePendingTask(pendingTask)
                    }, 'danger')
                    .withIcon('danger')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('objectName')
                    .withField('Jabatan | Jenjang', 'text')
                    .build()
            )
            .build()
    }

    deletePendingTask (pendingTask: PendingTask) {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return

                this.pendingTaskService
                    .deletePendingTaskByInstanceId(pendingTask.instanceId)
                    .subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'Success',
                                'Berhasil menghapus data antrian'
                            )
                            this.refresh = !this.refresh
                        },
                        error: error => {
                            console.log('error', error)
                            this.alertService.showToast(
                                'Error',
                                'Gagal menghapus data antrian'
                            )
                        }
                    })
            }
        })
    }

    handleFormInit () {
        this.rwJabatanForm = new FormGroup({
            jabatanCode: new FormControl('', [Validators.required]),
            jenjangCode: new FormControl('', [Validators.required]),
            tmt: new FormControl('', [Validators.required]),
            fileSkJabatan: new FormControl('', [Validators.required])
        })
    }

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.rwJabatanForm.get(controlName),
            controlName,
            label
        )
    }

    handleSubscribe () {
        this.rwJabatanForm
            .get('jabatanCode')
            .valueChanges.subscribe(jabatanCode => {
                if (jabatanCode) {
                    this.getJenjangList(jabatanCode)
                } else {
                    this.jenjangList = null
                    this.rwJabatanForm.get('jenjangCode').setValue('')
                }
            })
    }

    fileLoadHandler () {
        this.inputs = {
            files: {
                ijazah: {
                    label: 'Upload Dokumen SK Jabatan',
                    fileName: this.rwJabatan.skJabatan,
                    source: this.rwJabatan.skJabatanUrl,
                    required: true
                }
            },
            maxSize: 2 * 1024 * 1024,
            allowedTypes: [{ type: 'application/pdf' }],
            listen: (key: string, source: string, base64Data: string) => {
                this.rwJabatanForm.patchValue({
                    fileSkJabatan: base64Data
                })
            }
        }
    }

    getJabatanList () {
        this.jabatanListLoading$.next(true)
        this.apiService.getData(`/api/v1/jabatan`).subscribe({
            next: response => {
                this.jabatanList = response.map(
                    (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
                )
                this.jabatanListLoading$.next(false)
            },
            error: error => {
                console.log('error', error)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data jabatan!'
                )
                this.jabatanListLoading$.next(false)
            }
        })
    }

    getJenjangList (jabatanId: string) {
        this.jenjangLoading$.next(true)
        this.apiService
            .getData(`/api/v1/jenjang/jabatan/${jabatanId}`)
            .subscribe({
                next: response => {
                    this.jenjangList = response.map(
                        (jenjang: { [key: string]: any }) =>
                            new Jenjang(jenjang)
                    )
                    this.rwJabatanForm
                        .get('jenjangCode')
                        .patchValue(this.jenjangList[0].code)
                    this.jenjangLoading$.next(false)
                },
                error: error => {
                    console.log('error', error)
                    this.jenjangLoading$.next(false)
                    this.alertService.showToast(
                        'Error',
                        'Gagal mendapatkan data jenjang!'
                    )
                }
            })
    }

    getPendingRWJabatan (id: string) {
        this.rwJabatanLoading$.next(true)
        this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
            next: response => {
                const pendingTask = new PendingTask(response)
                this.rwJabatan = new RWJabatan(pendingTask.objectTask.object)
                this.getJenjangList(this.rwJabatan.jabatanCode)
                this.rwJabatanForm.patchValue({
                    jabatanCode: this.rwJabatan.jabatanCode,
                    jenjangCode: this.rwJabatan.jenjangCode,
                    tmt: this.rwJabatan.tmt
                })
                this.fileLoadHandler()
                this.rwJabatanLoading$.next(false)
            },
            error: error => {
                console.log('error', error)
                this.rwJabatanLoading$.next(false)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data jabatan!'
                )
            }
        })
    }

    back () {
        this.jabatanList.length = 0
        this.jenjangList.length = 0
        this.pendingTask = null
        this.isDetailOpen = false
        this.rwJabatan = new RWJabatan()
        this.fileLoadHandler()
        this.rwJabatanForm.reset()
    }

    submit () {
        if (this.rwJabatanForm.valid) {
            this.rwJabatan.jabatanCode = this.rwJabatanForm.value.jabatanCode
            this.rwJabatan.jenjangCode = this.rwJabatanForm.value.jenjangCode
            this.rwJabatan.tmt = this.rwJabatanForm.value.tmt
            this.rwJabatan.fileSkJabatan =
                this.rwJabatanForm.value.fileSkJabatan

            this.confirmationService.open(false).subscribe({
                next: result => {
                    if (!result.confirmed) return
                    this.submitLoading$.next(true)

                    const task = new Task()
                    task.id = this.pendingTask.id
                    task.taskAction = 'approve'
                    task.object = this.rwJabatan

                    this.apiService
                        .postData(`/api/v1/rw_jabatan/task/submit`, task)
                        .subscribe({
                            next: () => {
                                this.alertService.showToast(
                                    'Success',
                                    'Berhasil memperbarui riwayat jabatan.'
                                )
                                this.submitLoading$.next(false)
                                this.back()
                            },
                            error: error => {
                                console.log('error', error)
                                this.alertService.showToast(
                                    'Error',
                                    'Gagal memperbarui riwayat jebatan!'
                                )
                            }
                        })
                }
            })
        }
    }
}
