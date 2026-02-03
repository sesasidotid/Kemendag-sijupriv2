import { Component } from '@angular/core'
import { FormasiRequest } from '../../../modules/formasi/models/formasi-request.model'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { PendingTask } from '../../../modules/workflow/models/pending-task.model'
import { CommonModule } from '@angular/common'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { Formasi } from '../../../modules/formasi/models/formasi.model'
import { BehaviorSubject, take } from 'rxjs'
import { Task } from '../../../modules/workflow/models/task.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
import { PrevPendingTask } from '../../../modules/formasi/models/prev-pending-task'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { LucideAngularModule } from 'lucide-angular'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
    FormBuilder,
} from '@angular/forms'
import { HandlerService } from '../../../modules/base/services/handler.service'

import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { Router } from '@angular/router'
import { first } from 'rxjs/operators'
import { LoadingButtonComponent } from '../../../modules/base/components/loading-button/loading-button.component'
@Component({
    selector: 'app-deprecated_formasi-task-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        LucideAngularModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './formasi-task-detail.component.html',
    styleUrl: './formasi-task-detail.component.scss',
})
export class FormasiTaskDetailComponent {
    pendingTask: PendingTask = new PendingTask()
    formasiRequest: FormasiRequest = new FormasiRequest()
    unitKerja: UnitKerja = new UnitKerja()
    formasiList: Formasi[] = []
    JenjangList: Jenjang[] = []

    pendingTaskId: string = ''
    unit_kerja_id: string = ''
    isApproveEnable: boolean = true

    prevPendingTask: PrevPendingTask
    prevApprovedTask: any[] = []
    task = new Task()

    fileRekomendasi: string = ''

    jabatanMapping: { [key: string]: string } = {
        JB1: 'Analis Perdagangan',
        JB4: 'Pengawas Perdagangan',
        JB7: 'Penguji Mutu Barang',
        JB8: 'Pengawas Kemetrologian',
        JB10: 'Pengamat Tera',
        JB11: 'Penera',
    }

    isFl2Loading$ = new BehaviorSubject<boolean>(false)
    isFl3Loading$ = new BehaviorSubject<boolean>(false)
    isF15Loading$ = new BehaviorSubject<boolean>(false)
    waktuInput: {
        fileUndangan?: string
    } = {}

    inputs: FIleHandler = {
        files: {
            question_template: { label: 'Surat Undangan' },
        },
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
        ) => {
            switch (key) {
                case 'question_template':
                    this.waktuInput.fileUndangan = base64Data
                    break
            }
        },
    }

    inputsFileRekomendasi: FIleHandler = {
        files: {
            file_rekomendasi: { label: 'File Rekomendasi Formasi' },
        },
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
        ) => {
            switch (key) {
                case 'file_rekomendasi':
                    this.fileRekomendasi = base64Data
                    break
            }
        },
    }

    flow3Form: FormGroup
    waktuPelaksanaanForm: FormGroup

    constructor(
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private filePreviewService: FilePreviewService,
        private handlerService: HandlerService,
        private fb: FormBuilder,
        private router: Router,
    ) {}

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((params) => {
            this.unit_kerja_id = params.get('id')
        })

        this.handleFormInit()
        this.getListJenjang()
        this.getPendingTask()
    }

    isUndanganFileMissing(): boolean {
        return !this.waktuInput?.fileUndangan
    }

    handleFormInit() {
        this.waktuPelaksanaanForm = new FormGroup({
            waktuPelaksanaan: new FormControl('', Validators.required),
        })

        this.flow3Form = this.fb.group({})
    }

    isFileRekomendasiMissing(): boolean {
        return !this.fileRekomendasi
    }

    isFileUndanganMissing(): boolean {
        return !this.waktuInput.fileUndangan
    }

    hoveredJabatanIndex: number | null = null

    hoverJabatan(index: number, isHovering: boolean) {
        this.hoveredJabatanIndex = isHovering ? index : null
    }

    getPendingTask() {
        this.apiService
            //   .getData(`/api/v1/pending_task/${this.pendingTaskId}`)
            .getData(`/api/v1/formasi/task/unit_kerja/${this.unit_kerja_id}`)
            .subscribe({
                next: (response) => {
                    this.pendingTask = new PendingTask(response)
                    this.formasiRequest = new FormasiRequest(
                        this.pendingTask.objectTask.object,
                        // this.pendingTask
                    )

                    this.prevPendingTask = new PrevPendingTask(
                        this.pendingTask.objectTask.prevObject,
                    )

                    if (this.formasiRequest.unitKerjaId) {
                        this.getUnitKerja(this.formasiRequest.unitKerjaId)
                    }

                    this.findApproveDokumen(
                        this.prevPendingTask.formasiDokumenList,
                    )
                    this.getPendingFormasi(this.pendingTask.objectId)

                    console.log(
                        'pendingTa222sk',
                        this.formasiRequest.formasiDokumenList,
                    )
                    //   for (const formasiDokumen of this.formasiRequest.formasiDokumenList) {
                    //     formasiDokumen.dokumenStatus = 'APPROVE'
                    //   }
                },
                error: (error) => {
                    console.error('Error fetching data', error)

                    //   this.alertService.showToast('Error', error.error.message)
                    //   throw error
                },
            })
    }

    preventMinus(event: KeyboardEvent) {
        if (event.key === '-' || event.key === 'e') {
            event.preventDefault()
        }
    }

    initializeForm() {
        console.log('formasiList', this.formasiList)
        this.formasiList.forEach((item, i) => {
            item.formasiResultDtoList.forEach((formasi, j) => {
                const controlName = `formasi_${i}_${j}`
                this.flow3Form.addControl(
                    controlName,
                    new FormControl(formasi.pembulatan || '0', [
                        Validators.pattern(/^\d+$/),
                    ]),
                )
            })
        })
    }

    getTotalRekapitulasi(): number {
        let total = 0
        this.formasiList.forEach((item) => {
            item.formasiResultDtoList.forEach((formasi) => {
                total += formasi.pembulatan || 0
            })
        })
        return total
    }

    getTotalRekomendasi(): number {
        let total = 0
        this.formasiList.forEach((item, i) => {
            item.formasiResultDtoList.forEach((formasi, j) => {
                const controlName = `formasi_${i}_${j}`
                const value = this.flow3Form.get(controlName)?.value || 0
                total += +value // Convert to number
            })
        })
        return total
    }

    getListJenjang() {
        this.apiService.getData(`/api/v1/jenjang`).subscribe({
            next: (res) => {
                this.JenjangList = res.map(
                    (jenjang: { [key: string]: any }) => new Jenjang(jenjang),
                )
            },
        })
    }

    findJenjangName(jenjangCode: string): string {
        const jenjang = this.JenjangList.find(
            (jenjang) => jenjang.code === jenjangCode,
        )
        return jenjang?.name || ''
    }

    findApproveDokumen(dokumenFormasiList: any[]) {
        this.prevApprovedTask = dokumenFormasiList.filter(
            (dokumen) => dokumen.dokumenStatus === 'APPROVE',
        )
        console.log('prevApprovedTask', this.prevApprovedTask)
    }

    isDocumentApproved(dokumenPersyaratanId: string): boolean {
        return this.prevApprovedTask.some(
            (approvedDokumen) =>
                approvedDokumen.dokumenPersyaratanId === dokumenPersyaratanId,
        )
    }

    getUnitKerja(unitKerjaId: string) {
        console.log('aaaa232', unitKerjaId)

        this.apiService.getData(`/api/v1/unit_kerja/${unitKerjaId}`).subscribe({
            next: (response) => {
                console.log('aaaa', this.unitKerja)

                this.unitKerja = new UnitKerja(response)
            },
            error: (error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.error.message)
                throw error
            },
        })
    }

    getPendingFormasi(formasi_id: string) {
        this.apiService
            .getData(`/api/v1/formasi_detail/formasi/${formasi_id}`)
            //   .getData(`/api/v1/formasi_detail/jabatan_list`)
            .subscribe({
                next: (response) => {
                    console.log('n', response)
                    this.formasiList = response.map(
                        (formasi: { [key: string]: any }) =>
                            new Formasi(formasi),
                    )
                    this.initializeForm()

                    console.log('b', this.formasiList)
                },
                error: (error) => {
                    console.error('Error fetching data', error)
                    this.alertService.showToast('Error', error.error.message)
                    throw error
                },
            })
    }

    onFileChange(event: any) {
        const file = event.target.files[0]

        if (file) {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = () => {
                this.formasiRequest.fileRekomendasi = reader.result as string
            }

            reader.onerror = (error) => {
                console.error('Error: ', error)
            }
        }
    }

    onFIleSwitch(index: number, status: 'APPROVE' | 'REJECT') {
        this.formasiRequest.formasiDokumenList[index].dokumenStatus = status

        for (const formasiDokumen of this.formasiRequest.formasiDokumenList) {
            if (formasiDokumen.dokumenStatus == 'REJECT') {
                this.isApproveEnable = false
                break
            }
            this.isApproveEnable = true
        }
    }

    submitFl2(isApprove: boolean) {
        this.task.id = this.pendingTask.id
        this.task.taskAction = isApprove ? 'approve' : 'reject'

        if (isApprove) {
            const waktuPelaksanaan =
                this.waktuPelaksanaanForm.get('waktuPelaksanaan')?.value
            this.task.object.waktuPelaksanaan = waktuPelaksanaan
            this.task.object.fileSuratUndangan = this.waktuInput.fileUndangan
        }

        if (!isApprove) {
            const rejectedDokumenUkomList =
                this.formasiRequest.formasiDokumenList.filter(
                    (dokumen) => dokumen.dokumenStatus === 'REJECT',
                )

            if (rejectedDokumenUkomList.length > 0) {
                this.task.object = {
                    formasi_dokumen_list: rejectedDokumenUkomList,
                }
            }
        }

        this.confirmationService.open(!isApprove).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.isFl2Loading$.next(true)
                this.task.remark = result.comment || null

                this.apiService
                    .postData(`/api/v1/formasi/task/submit`, this.task)
                    .subscribe({
                        next: () => {
                            this.isFl2Loading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                            setTimeout(() => {
                                window.location.reload()
                            }, 1000)
                        },
                        error: (error) => {
                            this.isFl2Loading$.next(false)
                            console.error('Error fetching data', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengirim data',
                            )
                        },
                    })
            },
        })
    }

    submitFl3() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                const formasiDetailDtoList = this.formasiList.map(
                    (item, i) => ({
                        id: item.id,
                        formasiResultDtoList: item.formasiResultDtoList.map(
                            (formasi, j) => {
                                const controlValue =
                                    this.flow3Form.get(`formasi_${i}_${j}`)
                                        ?.value ?? '0'
                                return {
                                    id: formasi.id,
                                    result: controlValue.toString(),
                                }
                            },
                        ),
                    }),
                )

                const payload = {
                    id: this.pendingTask.id,
                    taskAction: 'approve',
                    object: {
                        id: this.pendingTask.objectId,
                        formasiDetailDtoList: formasiDetailDtoList,
                    },
                }

                this.isFl3Loading$.next(true)
                this.apiService
                    .postData(`/api/v1/formasi/task/submit`, payload)
                    .subscribe({
                        next: () => {
                            this.isFl3Loading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                            setTimeout(() => {
                                window.location.reload()
                            }, 1000)
                        },
                        error: (error) => {
                            this.isFl3Loading$.next(false)
                            console.error('Error fetching data', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengirim data',
                            )
                        },
                    })
            },
        })
    }

    submitFl5() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                this.isF15Loading$.next(true)

                const payload = {
                    id: this.pendingTask.id,
                    task_action: 'approve',
                    object: {
                        fileRekomendasi: this.fileRekomendasi,
                    },
                }
                this.apiService
                    .postData(`/api/v1/formasi/task/submit`, payload)
                    .subscribe({
                        next: () => {
                            this.isF15Loading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                            this.router.navigate(['/formasi/formasi-task-list'])
                        },
                        error: (error) => {
                            this.isF15Loading$.next(false)
                            console.error('Error fetching data', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengirim data',
                            )
                        },
                    })
            },
        })
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }
}
