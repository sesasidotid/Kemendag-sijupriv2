import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { RWKinerja } from '../../../../modules/siap/models/rw-kinerja.model'
import { RatingKinerja } from '../../../../modules/maintenance/models/rating-kinerja.model'
import { PredikatKinerja } from '../../../../modules/maintenance/models/predikat-kinerja.model'
import { CommonModule } from '@angular/common'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { fileValidator } from '../../../../modules/base/validators/file-format.validator'
import { BehaviorSubject, finalize } from 'rxjs'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'

@Component({
    selector: 'app-rw-kinerja-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './rw-kinerja-add.component.html',
    styleUrl: './rw-kinerja-add.component.scss',
})
export class RwKinerjaAddComponent {
    rwKinerja: RWKinerja = new RWKinerja()
    ratingKinerjaList: RatingKinerja[]
    predikatKinerjaList: PredikatKinerja[]

    predikatLoading$ = new BehaviorSubject<boolean>(false)
    ratingLoading$ = new BehaviorSubject<boolean>(false)
    submitLoading$ = new BehaviorSubject<boolean>(false)

    rwKinerjaForm!: FormGroup
    isAnnual: boolean = false
    years: number[] = []
    months = [
        { value: '01', name: 'Januari' },
        { value: '02', name: 'Februari' },
        { value: '03', name: 'Maret' },
        { value: '04', name: 'April' },
        { value: '05', name: 'Mei' },
        { value: '06', name: 'Juni' },
        { value: '07', name: 'Juli' },
        { value: '08', name: 'Agustus' },
        { value: '09', name: 'September' },
        { value: '10', name: 'Oktober' },
        { value: '11', name: 'November' },
        { value: '12', name: 'Desember' },
    ]

    inputs: FIleHandler = {
        files: {
            docEvaluas: {
                label: 'Upload Dokumen Evaluasi kinerja',
                fileName: this.rwKinerja.docEvaluasi,
                source: this.rwKinerja.docEvaluasiUrl,
                required: true,
            },
            docPredikat: {
                label: 'Upload Dokumen Konversi Predikat Kinerja',
                fileName: this.rwKinerja.docPredikat,
                source: this.rwKinerja.docPredikatUrl,
                required: true,
            },
            docAkumulasiAk: {
                label: 'Upload Dokumen Akumulasi Angka Kredit',
                fileName: this.rwKinerja.docAkumulasiAk,
                source: this.rwKinerja.docAkumulasiAkUrl,
                required: true,
            },
            docPenetapanAk: {
                label: 'Upload Dokumen Penetapan Angka Kredit',
                fileName: this.rwKinerja.docPenetapanAk,
                source: this.rwKinerja.docPenetapanAkUrl,
                required: true,
            },
        },
        allowedTypes: [{ type: 'application/pdf' }],
        maxSize: 2 * 1024 * 1024,
        listen: (key: string, source: string, base64Data: string) => {
            if (key == 'docEvaluas')
                this.rwKinerjaForm.patchValue({ fileDocEvaluasi: base64Data })
            if (key == 'docPredikat')
                this.rwKinerjaForm.patchValue({ fileDocPredikat: base64Data })
            if (key == 'docAkumulasiAk')
                this.rwKinerjaForm.patchValue({
                    fileDocAkumulasiAk: base64Data,
                })
            if (key == 'docPenetapanAk')
                this.rwKinerjaForm.patchValue({
                    fileDocPenetapanAk: base64Data,
                })
        },
    }

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit() {
        this.populateYears()
        this.handleFormInit()
        this.getRatingKinerjaList()
        this.getPredikatKinerjaList()
        this.handleSubscribe()
    }

    populateYears() {
        const currentYear = new Date().getFullYear()
        for (let i = currentYear; i >= currentYear - 20; i--) {
            this.years.push(i)
        }
    }

    handleSubscribe() {
        const typeControl = this.rwKinerjaForm.get('type')
        typeControl?.valueChanges.subscribe((type) => {
            this.isAnnual = type === 'tahunan'
            this.updateFormControlsForType(type)
        })
    }

    updateFormControlsForType(type: string) {
        if (type === 'tahunan') {
            this.rwKinerjaForm.removeControl('monthStart')
            this.rwKinerjaForm.removeControl('monthEnd')
        } else if (type === 'bulanan') {
            this.rwKinerjaForm.addControl(
                'monthStart',
                new FormControl('', Validators.required),
            )
            this.rwKinerjaForm.addControl(
                'monthEnd',
                new FormControl('', Validators.required),
            )
        }
        this.rwKinerjaForm.get('dateStart')?.setValue('')
        this.rwKinerjaForm.get('dateEnd')?.setValue('')

        if (this.isAnnual) {
            this.onYearSelected()
        } else {
            this.onMonthRangeSelected()
        }
    }

    onYearSelected() {
        const year = this.rwKinerjaForm.get('year')?.value
        this.rwKinerjaForm.get('dateStart')?.setValue(`${year}-01-01`)
        this.rwKinerjaForm.get('dateEnd')?.setValue(`${year}-12-31`)
    }

    onMonthRangeSelected() {
        const startMonth = this.rwKinerjaForm.get('monthStart')?.value
        const endMonth = this.rwKinerjaForm.get('monthEnd')?.value
        const selectedYear = this.rwKinerjaForm.get('year')?.value

        console.log(startMonth, endMonth, selectedYear)

        if (startMonth && endMonth && selectedYear) {
            const startDate = new Date(
                selectedYear,
                parseInt(startMonth) - 1,
                1,
            )
            const endDate = new Date(selectedYear, parseInt(endMonth), 0)

            if (parseInt(startMonth) > parseInt(endMonth)) {
                this.rwKinerjaForm
                    .get('monthEnd')
                    ?.setErrors({ monthOrder: true })
                this.rwKinerjaForm.get('dateStart')?.setValue('')
                this.rwKinerjaForm.get('dateEnd')?.setValue('')
                return
            } else {
                this.rwKinerjaForm.get('monthEnd')?.setErrors(null)
            }

            this.rwKinerjaForm
                .get('dateStart')
                ?.setValue(this.formatDate(startDate))
            this.rwKinerjaForm
                .get('dateEnd')
                ?.setValue(this.formatDate(endDate))
        } else {
            this.rwKinerjaForm.get('dateStart')?.setValue('')
            this.rwKinerjaForm.get('dateEnd')?.setValue('')
        }
    }

    formatDate(date: Date): string {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.rwKinerjaForm.get(controlName),
            controlName,
            label,
        )
    }

    handleFormInit() {
        this.rwKinerjaForm = new FormGroup({
            predikatKinerjaId: new FormControl('', [Validators.required]),
            ratingHasilId: new FormControl('', [Validators.required]),
            ratingKinerjaId: new FormControl('', [Validators.required]),
            type: new FormControl('', [Validators.required]),
            angkaKredit: new FormControl('', [
                Validators.required,
                Validators.pattern('^[0-9]+(\\.[0-9]+)?$'),
            ]),
            fileDocEvaluasi: new FormControl('', [
                Validators.required,
                fileValidator(['application/pdf'], 2),
            ]),
            fileDocPredikat: new FormControl('', [
                Validators.required,
                fileValidator(['application/pdf'], 2),
            ]),
            fileDocAkumulasiAk: new FormControl('', [
                Validators.required,
                fileValidator(['application/pdf'], 2),
            ]),
            fileDocPenetapanAk: new FormControl('', [
                Validators.required,
                fileValidator(['application/pdf'], 2),
            ]),
            year: new FormControl('', [Validators.required]),
            monthStart: new FormControl('', []),
            monthEnd: new FormControl('', []),
            // Hidden controls for actual date values
            dateStart: new FormControl('', [Validators.required]),
            dateEnd: new FormControl('', [Validators.required]),
        })
    }

    getRatingKinerjaList() {
        this.ratingLoading$.next(true)
        this.apiService.getData(`/api/v1/rating_kinerja`).subscribe({
            next: (response) => {
                this.ratingKinerjaList = response.map(
                    (ratingKinerja: { [key: string]: any }) =>
                        new RatingKinerja(ratingKinerja),
                )
                this.ratingLoading$.next(false)
            },
            error: (error) => {
                console.log('error', error)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data rating kinerja!',
                )
                this.ratingLoading$.next(false)
            },
        })
    }

    getPredikatKinerjaList() {
        this.predikatLoading$.next(true)
        this.apiService.getData(`/api/v1/predikat_kinerja`).subscribe({
            next: (response) => {
                this.predikatKinerjaList = response.map(
                    (predikatKinerja: { [key: string]: any }) =>
                        new PredikatKinerja(predikatKinerja),
                )
                this.predikatLoading$.next(false)
            },
            error: (error) => {
                console.log('error', error)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data predikat kinerja!',
                )
                this.predikatLoading$.next(false)
            },
        })
    }

    submit() {
        this.rwKinerja = new RWKinerja(this.rwKinerjaForm.value)
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                this.submitLoading$.next(true)
                this.apiService
                    .postData(`/api/v1/rw_kinerja/task`, this.rwKinerja)
                    .pipe(
                        finalize(() => {
                            this.submitLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'Success',
                                'Berhasil menambahkan riwayat kinerja.',
                            )
                            setTimeout(() => {
                                this.router.navigate([
                                    '/profile/rw-kinerja/pending',
                                ])
                            }, 1000)
                        },
                        error: (error) => {
                            console.log('error', error)
                            this.alertService.showToast(
                                'Error',
                                'Gagal menambahkan riwayat kinerja!',
                            )
                        },
                    })
            },
        })
    }
}
