import { CommonModule } from '@angular/common'
import { Component, Input, SimpleChanges, ViewChild } from '@angular/core'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { Jabatan } from '../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { JF } from '../../../modules/siap/models/jf.model'
import { DokumenUkomPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan-ukom'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import {
    BehaviorSubject,
    combineLatest,
    EMPTY,
    filter,
    finalize,
    map,
    Observable,
    of,
    startWith,
    Subject,
    switchMap,
    take,
    takeUntil,
    tap,
} from 'rxjs'
import { BidangJabatan } from '../../../modules/maintenance/models/bidang-jabatan.model'
import { FormValidationService } from '../../../modules/base/services/form-validation.service'
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { UkomTaskService } from '@/modules/ukom/services/ukom-task.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'

@Component({
    selector: 'app-ukom-task-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        ReactiveFormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-task-form.component.html',
    styleUrl: './ukom-task-form.component.scss',
})
export class UkomTaskFormComponent {
    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent
    @Input() jf: JF
    @Input() ukom: Ukom = new Ukom()

    pesertaUkom: PesertaUkom = new PesertaUkom()
    jabatanList: Jabatan[] = []
    jenjangList: Jenjang[] = []
    nextJenjang: Jenjang
    detectedDokumen: any = {}
    passwordForm: FormGroup
    dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

    inputs: FIleHandler = {
        files: {},
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
            id: string,
        ) => {
            this.detectedDokumen[key] = {
                base64: base64Data,
                label: label,
                id: id,
            }
        },
    }
    hadItemsLoading$ = new BehaviorSubject<boolean>(false)
    destroy$ = new Subject<void>()
    isMengulang$ = new BehaviorSubject<boolean>(false)
    jabatanCodeArgument$ = new BehaviorSubject<string | null>(null)
    jenjangCodeArgument$ = new BehaviorSubject<string | null>(null)
    jenisUkom$ = new BehaviorSubject<string | null>(null)
    bidangJabatanList$: Observable<BidangJabatan[]> = of([])

    pendidikanJF: string = ''
    jurusanJF: string = ''

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
        public jenisUkomService: JenisUkomService,
        public ukomTaskService: UkomTaskService,
        public ukomDocumentService: UkomDocumentService,
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ukom'] || changes['jf']) {
            this.handleFormInit()
            this.handleSubscribe()
            this.setupInstansiValidation()
            this.handleFetchDokumenPersyaratan()
            this.getJFPendidikan()
            this.getListJabatan()
            this.getListJenjang()
            if (this.jf) this.getLast2TahunPredikatJF()
        }
    }

    handleSubscribe() {
        const jenisUkomControl = this.passwordForm.get('jenis_ukom')
        const nextJabatanControl = this.passwordForm.get('next_jabatan_code')
        const nextJenjangControl = this.passwordForm.get('next_jenjang_code')
        const isMengulangControl = this.passwordForm.get('isMengulang')
        const bidangJabatanControl = this.passwordForm.get(
            'bidang_jabatan_code',
        )

        isMengulangControl.valueChanges
            .pipe(
                takeUntil(this.destroy$),
                map((value) =>
                    value === 'true' ? true : value === 'false' ? false : null,
                ),
            )
            .subscribe((value) => {
                this.isMengulang$.next(value)
            })

        nextJabatanControl.valueChanges.subscribe((next_jabatan_code) => {
            if (next_jabatan_code) {
                bidangJabatanControl.setValue('')
                nextJenjangControl.setValue('')
                this.getBidangJabatanByJabatanCode(next_jabatan_code)
                if (jenisUkomControl.value === 'PERPINDAHAN_JABATAN') {
                    this.getListJenjangForPerpindahanJabatan(next_jabatan_code)
                }

                this.pesertaUkom.nextJabatanCode = next_jabatan_code
                this.jabatanCodeArgument$.next(next_jabatan_code)
            }
        })

        nextJenjangControl.valueChanges.subscribe((next_jenjang_code) => {
            if (next_jenjang_code) {
                this.jenjangCodeArgument$.next(next_jenjang_code)
            }
        })

        jenisUkomControl.valueChanges.subscribe((jenis_ukom) => {
            if (jenis_ukom) {
                this.jenisUkom$.next(jenis_ukom)
                this.clearFilesName()
                this.detectedDokumen = {}
                this.inputs.files = {}
                bidangJabatanControl.setValue('')

                this.bidangJabatanList$ = of([])

                this.jabatanCodeArgument$.next(null)
                this.jenjangCodeArgument$.next(null)
                this.isMengulang$.next(false)
                nextJabatanControl.setValue('')
                nextJenjangControl.setValue('')

                if (jenis_ukom == 'PERPINDAHAN_JABATAN') {
                    nextJabatanControl.setValue('')
                    nextJenjangControl.setValue('')

                    nextJabatanControl.enable()
                    nextJenjangControl.enable()
                }

                if (
                    jenis_ukom == 'KENAIKAN_JENJANG' ||
                    jenis_ukom == 'PROMOSI_JF'
                ) {
                    this.getListJenjang()
                    nextJabatanControl.disable()
                    nextJenjangControl.disable()

                    nextJabatanControl.setValue(this.jf.jabatanCode)
                    this.getNextJenjang()
                }
            }
        })
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.passwordForm.get(controlName),
            controlName,
            label,
        )
    }

    handleFormInit() {
        this.passwordForm = new FormGroup({
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(8),
            ]),
            confirmPassword: new FormControl('', [
                Validators.required,
                this.passwordMatchValidator.bind(this),
            ]),
            isMengulang: new FormControl('', [Validators.required]),
            jenis_ukom: new FormControl('', Validators.required),
            next_jabatan_code: new FormControl('', Validators.required),
            next_jenjang_code: new FormControl('', Validators.required),
            bidang_jabatan_code: new FormControl(''),
            no_surat_usulan: new FormControl('', Validators.required),
            tglSuratUsulan: new FormControl('', Validators.required),
        })
    }

    setupInstansiValidation() {
        this.bidangJabatanList$
            .pipe(takeUntil(this.destroy$))
            .subscribe((bidangList) => {
                const bidangJabatanControl = this.passwordForm.get(
                    'bidang_jabatan_code',
                )

                if (bidangList.length > 0) {
                    bidangJabatanControl?.setValidators(Validators.required)
                } else {
                    bidangJabatanControl?.clearValidators()
                }

                bidangJabatanControl?.updateValueAndValidity()
            })
    }

    handleFetchDokumenPersyaratan() {
        combineLatest([
            this.jenisUkom$.pipe(startWith(null)),
            this.jabatanCodeArgument$.pipe(startWith(null)),
            this.jenjangCodeArgument$.pipe(startWith(null)),
            this.isMengulang$.pipe(
                startWith(
                    null,
                    map((value) =>
                        value === 'true'
                            ? true
                            : value === 'false'
                              ? false
                              : null,
                    ),
                ),
            ),
        ])
            .pipe(
                filter(
                    ([jenisUkom, jabatanCode, JenjangCode, isMengulang]) =>
                        !!jenisUkom &&
                        !!jabatanCode &&
                        !!JenjangCode &&
                        isMengulang !== null,
                ),
                tap(() => {
                    this.clearFilesName()
                }),
            )
            .subscribe(([jenisUkom, jabatanCode, JenjangCode, isMengulang]) => {
                this.getDokumenPersyaratan(
                    jenisUkom,
                    jabatanCode,
                    JenjangCode,
                    isMengulang,
                )
            })
    }

    getBidangJabatanByJabatanCode(jabatanCode: string): void {
        this.bidangJabatanList$ = this.apiService
            .getData(`/api/v1/bidang_jabatan/jabatan/${jabatanCode}`)
            .pipe(
                map((res: any) =>
                    Array.isArray(res) && res.length > 0
                        ? res.map(
                              (bidangJabatan: { [key: string]: any }) =>
                                  new BidangJabatan(bidangJabatan),
                          )
                        : [],
                ),
                startWith([]),
            )
    }

    passwordMatchValidator(
        control: FormControl,
    ): { [key: string]: boolean } | null {
        if (this.passwordForm) {
            const password = this.passwordForm.get('password')?.value
            const confirmPassword = control.value
            if (password !== confirmPassword) {
                return { mismatch: true }
            }
        }
        return null
    }

    clearFilesName() {
        if (this.fileHandler) {
            this.fileHandler.clearFileName()
        }
    }

    getDokumenPersyaratan(
        jenisUkom: string,
        jabatan: string,
        jenjang: string,
        isMengulang: boolean,
    ) {
        this.ukomDocumentService.getDocumentByJenisUkom(jenisUkom)
        this.ukomDocumentService.documentByJenisUkom$
            .pipe(
                filter((docs) => docs.length > 0),
                map((docs) =>
                    docs
                        .filter((dokumen) => {
                            const specificationMatch =
                                dokumen.specification === null ||
                                dokumen.specification === 'jf' ||
                                dokumen.specification === 'false'
                            const jabatanMatch =
                                !dokumen.jabatanCode ||
                                dokumen.jabatanCode === jabatan
                            const jenjangMatch =
                                !dokumen.jenjangCode ||
                                dokumen.jenjangCode === jenjang
                            const isMengulangMatch = isMengulang
                                ? true
                                : dokumen.isMengulang === false

                            return (
                                specificationMatch &&
                                jabatanMatch &&
                                jenjangMatch &&
                                isMengulangMatch
                            )
                        })
                        .map(
                            (dokumen: any) =>
                                new DokumenUkomPersyaratan({
                                    dokumenPersyaratanId:
                                        dokumen.dokumenPersyaratanId,
                                    dokumenPersyaratanName:
                                        dokumen.dokumenPersyaratanName,
                                }),
                        ),
                ),
            )
            .subscribe({
                next: (filteredList: DokumenUkomPersyaratan[]) => {
                    this.dokumenPersyaratanList = filteredList

                    this.detectedDokumen = {}
                    this.inputs.files = {}

                    filteredList.forEach((dokumen) => {
                        const key = dokumen.dokumenPersyaratanId
                        this.inputs.files[key] = {
                            label: dokumen.dokumenPersyaratanName,
                            id: dokumen.dokumenPersyaratanId,
                        }
                    })
                },
                error: (error) =>
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil dokumen persyaratan',
                    ),
            })
        // this.apiService
        //     .getData(`/api/v1/document_ukom/jenis_ukom/${jenisUkom}`)
        //     .subscribe({
        //         next: (response) => {
        //             this.dokumenPersyaratanList = response
        //                 .filter((dokumen: any) => {
        //                     const jabatanMatch =
        //                         !dokumen.jabatanCode ||
        //                         dokumen.jabatanCode === jabatan
        //                     const jenjangMatch =
        //                         !dokumen.jenjangCode ||
        //                         dokumen.jenjangCode === jenjang
        //                     const isMengulangMatch = isMengulang
        //                         ? true
        //                         : dokumen.isMengulang === false

        //                     return (
        //                         jabatanMatch && jenjangMatch && isMengulangMatch
        //                     )
        //                 })
        //                 .map(
        //                     (dokumen: any) =>
        //                         new DokumenUkomPersyaratan({
        //                             dokumenPersyaratanId:
        //                                 dokumen.dokumenPersyaratanId,
        //                             dokumenPersyaratanName:
        //                                 dokumen.dokumenPersyaratanName,
        //                         }),
        //                 )

        //             this.detectedDokumen = {}
        //             this.inputs.files = {}

        //             this.dokumenPersyaratanList.forEach((dokumen, index) => {
        //                 const key = dokumen.dokumenPersyaratanId
        //                 this.inputs.files[key] = {
        //                     label: dokumen.dokumenPersyaratanName,
        //                     id: dokumen.dokumenPersyaratanId,
        //                 }
        //             })
        //         },
        //         error: (error) =>
        //             this.handlerService.handleAlert(
        //                 'Error',
        //                 'Gagal mengambil dokumen persyaratan',
        //             ),
        //     })
    }

    getNextJenjang() {
        this.apiService
            .getData(`/api/v1/jenjang/next/${this.jf.jenjangCode}`)
            .subscribe({
                next: (response: Jenjang) => {
                    this.nextJenjang = new Jenjang(response)
                    this.passwordForm
                        .get('next_jenjang_code')
                        ?.setValue(response.code)
                    this.jenjangCodeArgument$.next(response.code)
                },
                error: (error) =>
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil jenjang berikutnya',
                    ),
            })
    }

    isAnyFileMissing(): boolean {
        if (!this.inputs.files || Object.keys(this.inputs.files).length === 0) {
            return true
        }

        return Object.keys(this.inputs.files).some((key) => {
            return !this.detectedDokumen[key]
        })
    }

    getJFPendidikan() {
        this.apiService
            .getData(`/api/v1/rw_pendidikan/search?page=1&limit=100`)
            .subscribe({
                next: (res) => {
                    const lastItem = res.data[res.data.length - 1]
                    if (lastItem) {
                        this.pendidikanJF = lastItem.pendidikanCode
                        this.jurusanJF = lastItem.jurusan
                    }
                },
            })
    }

    getLast2TahunPredikatJF() {
        this.apiService
            .getData(`/api/v1/rw_kinerja/jf/${this.jf.nip}/2`)
            .subscribe({
                next: (res: any[]) => {
                    const last2Tahun: RWKinerja[] = res.map(
                        (item: Partial<RWKinerja>) => new RWKinerja(item),
                    )

                    this.pesertaUkom.predikat_kinerja_1_id = null
                    this.pesertaUkom.predikat_kinerja_2_id = null

                    if (last2Tahun[0]) {
                        this.pesertaUkom.predikat_kinerja_1_id =
                            last2Tahun[0].predikatKinerjaId
                    }

                    if (last2Tahun[1]) {
                        this.pesertaUkom.predikat_kinerja_2_id =
                            last2Tahun[1].predikatKinerjaId
                    }
                },
            })
    }

    getListJabatan() {
        this.apiService.getData(`/api/v1/jabatan`).subscribe({
            next: (response) =>
                (this.jabatanList = response.map(
                    (jabatan: { [key: string]: any }) => new Jabatan(jabatan),
                )),
            error: (error) =>
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal Mengambil daftar jabatan',
                ),
        })
    }

    getListJenjang() {
        this.apiService.getData(`/api/v1/jenjang`).subscribe({
            next: (response) =>
                (this.jenjangList = response.map(
                    (jenjang: { [key: string]: any }) => new Jenjang(jenjang),
                )),
            error: (error) =>
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal Mengambil daftar jenjang',
                ),
        })
    }

    getListJenjangForPerpindahanJabatan(next_jabatan_code: string) {
        this.apiService
            .getData(`/api/v1/jenjang/jabatan/${next_jabatan_code}`)
            .subscribe({
                next: (response) =>
                    (this.jenjangList = response.map(
                        (jenjang: { [key: string]: any }) =>
                            new Jenjang(jenjang),
                    )),
                error: (error) =>
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal Mengambil daftar jenjang',
                    ),
            })
    }

    submit() {
        if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
            this.pesertaUkom.dokumenUkomList = []
        }

        this.pesertaUkom.dokumenUkomList = this.buildDokumenList()
        const payload = this.buildPayload()

        this.confirmationService
            .open(false)
            .pipe(
                switchMap((result) => {
                    this.hadItemsLoading$.next(true)

                    if (!result.confirmed) {
                        return EMPTY
                    }

                    this.ukomTaskService.checkEligibility(
                        payload.jenisUkom,
                        payload.nip,
                    )

                    return this.ukomTaskService.eligibility$.pipe(
                        filter(
                            (eligibility) => eligibility.eligible !== undefined,
                        ),
                        take(1),
                    )
                }),
                switchMap((eligibility) => {
                    console.log('Eligibility:', eligibility)
                    if (!eligibility.eligible) {
                        this.handlerService.handleAlert(
                            'Error',
                            eligibility.message ||
                                'Anda tidak memenuhi syarat untuk mengikuti ujian.',
                        )
                        return EMPTY
                    }

                    // continue with actual submit
                    return this.apiService.postData(
                        `/api/v1/participant_ukom/task/jf`,
                        payload,
                    )
                }),
                finalize(() => this.hadItemsLoading$.next(false)),
            )
            .subscribe({
                next: (result) => {
                    window.location.reload()
                },
                error: (error) => {
                    console.error('Submission error:', error)
                    this.handlerService.handleAlert(
                        'Error',
                        error.error.message,
                    )
                    this.hadItemsLoading$.next(false)
                },
            })
    }

    /**
     * Build dokumen list from detectedDokumen
     */
    private buildDokumenList(): any[] {
        const documentMap = new Map<string, any>()

        for (const key in this.detectedDokumen) {
            if (this.detectedDokumen.hasOwnProperty(key)) {
                const detected = this.detectedDokumen[key]
                const dokumenPersyaratan = this.dokumenPersyaratanList.find(
                    (dokumen) => dokumen.dokumenPersyaratanId === key,
                )

                if (dokumenPersyaratan) {
                    documentMap.set(detected.id, {
                        dokumenFile: detected.base64,
                        dokumenPersyaratanName: `${dokumenPersyaratan.dokumenPersyaratanName}_${this.jf.nip}_${Date.now()}`,
                        dokumenPersyaratanId: detected.id,
                    })
                }
            }
        }

        return Array.from(documentMap.values())
    }

    /**
     * Build payload for API submission
     */
    private buildPayload(): any {
        return {
            ...this.pesertaUkom,
            jenisUkom: this.passwordForm.get('jenis_ukom')?.value,
            nip: this.jf.nip,
            nextJenjangCode: this.passwordForm
                .get('next_jenjang_code')
                ?.getRawValue(),
            nextJabatanCode: this.passwordForm
                .get('next_jabatan_code')
                ?.getRawValue(),
            nextPangkatCode: this.jf.pangkatCode,
            password: this.passwordForm.get('password')?.value,
            bidang_jabatan_code: this.passwordForm.get('bidang_jabatan_code')
                ?.value,
            no_surat_usulan: this.passwordForm.get('no_surat_usulan')?.value,
            tglSuratUsulan: this.passwordForm.get('tglSuratUsulan')?.value,
            tanggalLahir: this.jf.tanggalLahir,
            pendidikanTerakhirCode: this.pendidikanJF,
            jurusan: this.jurusanJF,
            JenjangName: this.jf.jenjangName,
            isMengulang:
                String(this.passwordForm.get('isMengulang')?.value) === 'true',
        }
    }

    // submit() {
    //     if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
    //         this.pesertaUkom.dokumenUkomList = []
    //     }

    //     const documentMap = new Map()

    //     for (const key in this.detectedDokumen) {
    //         if (this.detectedDokumen.hasOwnProperty(key)) {
    //             const detected = this.detectedDokumen[key]

    //             const dokumenPersyaratan = this.dokumenPersyaratanList.find(
    //                 (dokumen) => dokumen.dokumenPersyaratanId === key,
    //             )

    //             if (dokumenPersyaratan) {
    //                 const newDoc = {
    //                     dokumenFile: detected.base64,
    //                     dokumenPersyaratanName: `${
    //                         dokumenPersyaratan.dokumenPersyaratanName
    //                     }_${this.jf.nip}_${Date.now()}`,
    //                     dokumenPersyaratanId: detected.id,
    //                 }

    //                 documentMap.set(detected.id, newDoc)
    //             }
    //         }
    //     }

    //     this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

    //     this.confirmationService.open(false).subscribe({
    //         next: (result) => {
    //             if (!result.confirmed) return
    //             this.hadItemsLoading$.next(true)

    //             this.pesertaUkom.jenisUkom =
    //                 this.passwordForm.get('jenis_ukom').value
    //             this.pesertaUkom.nip = this.jf.nip
    //             this.pesertaUkom.nextJenjangCode = this.passwordForm
    //                 .get('next_jenjang_code')
    //                 ?.getRawValue()
    //             this.pesertaUkom.nextJabatanCode = this.passwordForm
    //                 .get('next_jabatan_code')
    //                 ?.getRawValue()
    //             this.pesertaUkom.nextPangkatCode = this.jf.pangkatCode
    //             this.pesertaUkom.password =
    //                 this.passwordForm.get('password')?.value
    //             this.pesertaUkom.bidang_jabatan_code = this.passwordForm.get(
    //                 'bidang_jabatan_code',
    //             )?.value

    //             this.pesertaUkom.no_surat_usulan =
    //                 this.passwordForm.get('no_surat_usulan')?.value
    //             this.pesertaUkom.tglSuratUsulan =
    //                 this.passwordForm.get('tglSuratUsulan')?.value

    //             this.pesertaUkom.tanggalLahir = this.jf.tanggalLahir
    //             this.pesertaUkom.pendidikanTerakhirCode = this.pendidikanJF
    //             this.pesertaUkom.jurusan = this.jurusanJF
    //             this.pesertaUkom.JenjangName = this.jf.jenjangName
    //             this.pesertaUkom.isMengulang =
    //                 String(this.passwordForm.get('isMengulang')?.value) ===
    //                 'true'

    //             this.apiService
    //                 .postData(
    //                     `/api/v1/participant_ukom/task/jf`,
    //                     this.pesertaUkom,
    //                 )
    //                 .subscribe({
    //                     next: () => {
    //                         this.hadItemsLoading$.next(false)
    //                         window.location.reload()
    //                     },
    //                     error: (error) => {
    //                         this.hadItemsLoading$.next(false)
    //                         this.handlerService.handleException(error)
    //                     },
    //                 })
    //         },
    //         error: (error) => {
    //             this.handlerService.handleAlert('Error', error.error.message)
    //             this.hadItemsLoading$.next(false)
    //         },
    //     })
    // }
}
