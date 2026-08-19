import { HandlerService } from './../../../../modules/base/services/handler.service'
import { Component, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationDialogComponent } from '../../../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import { JabatanService } from '../../../../modules/maintenance/services/jabatan.service'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FormasiUnsur } from '../../../../modules/formasi/models/formasi-unsur.model'
import { FormasiService } from '../../../../modules/formasi/services/formasi.service'
import { FormasiResult } from '../../../../modules/formasi/models/formasi-result.model'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { FormasiRequest } from '../../../../modules/formasi/models/formasi-request.model'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { PendingFormasiService } from '../../../../modules/formasi/services/pending-formasi.service'
import { ApiService } from '../../../../modules/base/services/api.service'
import { PengaturanFormasiJabatan } from '../../../../modules/formasi/models/formasi-pengaturan-jabatan.model'
import { BehaviorSubject } from 'rxjs'
import { first } from 'rxjs/operators'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { Jenjang } from '@/modules/maintenance/models/jenjang.modle'
@Component({
    selector: 'app-formasi-jabatan',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './formasi-jabatan.component.html',
    styleUrl: './formasi-jabatan.component.scss',
})
export class FormasiJabatanComponent {
    isModalOpen = false
    isSavedFormasiDataOpen = false
    jabatanCode: string
    unitKerjaId = LoginContext.getUnitKerjaId()
    jabatan: Jabatan = new Jabatan()
    jenjangList: Jenjang[] = []

    formasiUnsurList: FormasiUnsur[] = []
    formasiResultList: FormasiResult[] = []
    unsurVolumeData: { [key: string]: { volume: number } } = {}

    formasiId: string = ''
    unsurList: any[] = []
    formasiRequest: FormasiRequest = new FormasiRequest()
    PengaturanFormasiJabatan: PengaturanFormasiJabatan[] = []
    selectedPengaturanFormasiJabatan: PengaturanFormasiJabatan

    @ViewChild(ConfirmationDialogComponent, { static: false })
    confirmationDialog!: ConfirmationDialogComponent
    isLoading$ = new BehaviorSubject<boolean>(false)
    isLoadingFormasiData = true

    constructor(
        private jabatanService: JabatanService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private handlerSerivce: HandlerService,
        private jenjangService: JenjangService,
    ) {}

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((params) => {
            this.jabatanCode = params.get('id')
        })

        this.getFormasiObjectTask()
        this.getFormasiId()
        this.getAllJenjang()
    }

    preventMinus(event: KeyboardEvent) {
        if (event.key === '-' || event.key === 'e') {
            event.preventDefault()
        }
    }

    getFormasiObjectTask() {
        this.getJabatan()
        this.getFormasiTree()
    }

    getPengaturanFormasiJabatan(formasi_id: string) {
        this.apiService
            .getData(`/api/v1/formasi_detail/formasi/${formasi_id}`)
            .subscribe({
                next: (response) => {
                    this.PengaturanFormasiJabatan = response

                    this.selectedPengaturanFormasiJabatan =
                        this.PengaturanFormasiJabatan.find(
                            (jabatan) =>
                                jabatan.jabatanCode === this.jabatanCode,
                        )

                    this.isLoadingFormasiData = false
                },
                error: () => {
                    console.warn(
                        'No documents found in pendingTask.dokumenUkomList',
                    )
                    this.isLoadingFormasiData = false
                },
            })
    }

    getFormasiId() {
        this.apiService
            .getData(`/api/v1/formasi/task/unit_kerja/${this.unitKerjaId}`)
            .subscribe({
                next: (response: any) => {
                    this.formasiId = response.objectId
                    this.getPengaturanFormasiJabatan(response.objectId)
                },
                error: (err) => {
                    this.isLoadingFormasiData = false
                },
            })
    }

    getAllJenjang() {
        this.jenjangService.findAll().subscribe({
            next: (response: Jenjang[]) => (this.jenjangList = response),
        })
    }

    getFormasiTree() {
        this.apiService
            .getData(`/api/v1/unsur/tree/${this.jabatanCode}`)
            .subscribe({
                next: (response: FormasiUnsur[]) =>
                    (this.formasiUnsurList = response),
            })
    }

    getJabatan() {
        this.jabatanService.findById(this.jabatanCode).subscribe({
            next: (jabatan: Jabatan) => (this.jabatan = jabatan),
        })
    }

    isSubmitted(jabatanCode: string) {
        return this.PengaturanFormasiJabatan.some(
            (jabatan) => jabatan.jabatanCode === jabatanCode,
        )
    }

    initiate(formasiUnsur: FormasiUnsur) {
        if (!this.unsurVolumeData[formasiUnsur.id]) {
            this.unsurVolumeData[formasiUnsur.id] = {
                volume: formasiUnsur.volume || 0,
            }
        }

        return true
    }

    totalPembulatan() {
        var total = 0
        this.formasiResultList.forEach((formasiResult) => {
            total = total + formasiResult.pembulatan
        })

        return total
    }

    totalPembulatanV2() {
        var total = 0
        this.selectedPengaturanFormasiJabatan?.formasiResultDtoList.forEach(
            (formasiResult) => {
                total = total + formasiResult.pembulatan
            },
        )

        return total
    }

    calculate() {
        this.unsurList.length = 0
        for (const key in this.unsurVolumeData) {
            this.unsurList.push({
                id: key,
                volume: this.unsurVolumeData[key].volume,
            })
        }

        this.apiService
            .postData('/api/v1/formasi_detail/calculate', {
                formasiId: this.formasiId,
                jabatanCode: this.jabatanCode,
                unsurDtoList: this.unsurList,
            })
            .subscribe({
                next: (response: FormasiResult[]) => {
                    this.formasiResultList = response
                    this.isModalOpen = true
                },
                error: (error) => {
                    if (error.error.code == 'VAL-00001') {
                        this.handlerSerivce.handleAlert(
                            'Error',
                            'Semua volume harus diisi',
                        )
                    } else {
                        this.handlerSerivce.handleAlert(
                            'Error',
                            'Gagal menghitung formasi',
                        )
                    }
                },
            })
    }

    openSavedFormasiModal() {
        this.isSavedFormasiDataOpen = true
    }

    mappingJenjangCode(jenjangCode: string): string {
        const jenjang = this.jenjangList?.find((j) => j.code === jenjangCode)
        return jenjang?.name
    }

    submit() {
        this.isLoading$.next(true)
        this.formasiRequest.formasiId = this.formasiId
        this.formasiRequest.jabatanCode = this.jabatanCode
        this.formasiRequest.unsurDtoList = this.unsurList

        this.apiService
            .postData('/api/v1/formasi_detail', this.formasiRequest)
            .subscribe({
                next: () => {
                    this.isLoading$.next(false)
                    this.router.navigate(['/formasi/formasi-task'])
                },
                error: () => {
                    this.isLoading$.next(false)
                    this.handlerSerivce.handleAlert(
                        'Error',
                        'Gagal menyimpan data',
                    )
                },
            })
    }
}
