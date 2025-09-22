import { Component, ViewChild } from '@angular/core'
import { Jabatan } from '../../../maintenance/models/jabatan.model'
import { Jenjang } from '../../../maintenance/models/jenjang.modle'
import { Pangkat } from '../../../maintenance/models/pangkat.model'
import { FileHandlerComponent } from '../file-handler/file-handler.component'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Observable } from 'rxjs'
import { DokumenUkomPersyaratan } from '../../../maintenance/models/dokumen-persyaratan-ukom'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { ApiService } from '../../services/api.service'
import { HandlerService } from '../../services/handler.service'
import { ConfirmationService } from '../../services/confirmation.service'
import { CommonModule } from '@angular/common'
import { finalize, map, tap } from 'rxjs/operators'
import { QRCodeModule } from 'angularx-qrcode'
import { SafeUrl } from '@angular/platform-browser'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
import { Router } from '@angular/router'
import { LandingPageComponent } from '../../../landing-page/landing-page.component'
import { BehaviorSubject } from 'rxjs'
import { KabKota } from '../../../maintenance/models/kab-kota.model'
import { Provinsi } from '../../../maintenance/models/provinsi.model'
import { forkJoin, combineLatest, startWith, of } from 'rxjs'
import { filter } from 'rxjs/operators'
import { PredikatKinerja } from '../../../maintenance/models/predikat-kinerja.model'
import { Pendidikan } from '../../../maintenance/models/pendidikan.model'
import { BidangJabatan } from '../../../maintenance/models/bidang-jabatan.model'
import { SystemConfigService } from '@/modules/base/services/system-config.service'
import {
    DokumenUkom,
    NonJFParticipantUkomTask,
} from '@/modules/ukom/models/ukom-registration-refactored/non-jf-participant-ukom-task.model'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'
@Component({
    selector: 'app-ukom-register',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FileHandlerComponent,
        QRCodeModule,
        ConfirmationDialogComponent,
        FilePreviewComponent,
        LandingPageComponent,
    ],
    templateUrl: './ukom-register.component.html',
    styleUrl: './ukom-register.component.scss',
})
export class UkomRegisterComponent {
    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent
    nonJFForm: FormGroup

    jabatanList$: Observable<Jabatan[]>
    jenjangList$: Observable<Jenjang[]>
    pangkatList$: Observable<Pangkat[]>
    NextjabatanList$: Observable<Jabatan[]>
    bidangJabatanList$: Observable<BidangJabatan[]> = of([])
    nextJenjang: Jenjang
    detectedDokumen: any = {}
    nonJFParticipantUkom: NonJFParticipantUkomTask
    dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

    provinsiList: Provinsi[] = []
    kabKotaList: KabKota[] = []
    predikatKinerjaList: PredikatKinerja[] = []
    pendidikanList: Pendidikan[] = []

    registerComplete: boolean = false

    private instansiSubject = new BehaviorSubject<string>('')
    instansi$ = this.instansiSubject.asObservable()

    stringCode: string = ''
    qrCodeDownloadLink: SafeUrl = ''
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
    imageUrl: string = ''
    nonJFNIP: string

    isRegisterOpenLoading$ = new BehaviorSubject<boolean>(false)
    isPredikatKinerjaLoading$ = new BehaviorSubject<boolean>(false)
    isPendidikanLoading$ = new BehaviorSubject<boolean>(false)
    isProvinsiLoading$ = new BehaviorSubject<boolean>(false)
    isLoading$: Observable<boolean>

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private router: Router,
        public systemConfigService: SystemConfigService,
        private ukomParticipantService: UkomParticipantService,
        public ukomDocumentService: UkomDocumentService,
    ) {
        this.isLoading$ = combineLatest([
            this.systemConfigService.isLoading$,
            this.isPredikatKinerjaLoading$,
            this.isPendidikanLoading$,
            this.isProvinsiLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit() {
        this.systemConfigService.checkUkomRegistration()
        this.getListJabatan()
        this.getListPangkat()
        this.getPredikatKinerja()
        this.getPendidikanList()
        this.getProvinsi()

        this.handleFormInitialization()
        this.setupInstansiValidation()
        this.handleFetchDokumenPersyaratan()
        this.handleSubscribe()
    }

    handleSubscribe() {
        this.nonJFForm
            .get('jenis_instansi')
            ?.valueChanges.subscribe((value) => {
                this.instansiSubject.next(value)
                this.nonJFForm.get('provinsi_id')?.setValue('')
                this.nonJFForm.get('kabupaten_kota_id')?.setValue('')
            })

        this.nonJFForm
            .get('provinsi_id')
            ?.valueChanges.subscribe((provinsiId) => {
                if (provinsiId) {
                    this.nonJFForm.get('kabupaten_kota_id')?.setValue('')
                    this.getKabKota(provinsiId)
                } else {
                    this.kabKotaList = []
                }
            })

        this.nonJFForm.get('jenis_ukom')?.valueChanges.subscribe((value) => {
            this.clearFilesName()
            this.nonJFForm.patchValue({
                nextJabatanCode: '',
                nextJenjangCode: '',
            })
            this.inputs.files = {}
            this.detectedDokumen = {}
        })

        this.nonJFForm
            .get('nextJabatanCode')
            ?.valueChanges.subscribe((value) => {
                this.nonJFForm.patchValue({
                    bidang_jabatan_code: '',
                })
                this.getBidangJabatanByJabatanCode(value)
                this.getListJenjang(value)
            })
    }

    handleFetchDokumenPersyaratan() {
        combineLatest([
            this.nonJFForm
                .get('jenis_ukom')!
                .valueChanges.pipe(startWith(null)),
            this.nonJFForm
                .get('nextJabatanCode')!
                .valueChanges.pipe(startWith(null)),
            this.nonJFForm
                .get('nextJenjangCode')!
                .valueChanges.pipe(startWith(null)),
            this.nonJFForm.get('isMengulang')!.valueChanges.pipe(
                startWith(null),
                map((value) =>
                    value === 'true' ? true : value === 'false' ? false : null,
                ),
            ),
        ])
            .pipe(
                filter(
                    ([jenis_ukom, jabatan, jenjang, isMengulang]) =>
                        !!jenis_ukom &&
                        !!jabatan &&
                        !!jenjang &&
                        isMengulang !== null,
                ),
                tap(() => {
                    this.clearFilesName()
                }),
            )
            .subscribe(([jenis_ukom, jabatan, jenjang, isMengulang]) => {
                this.getDokumenPersyaratan(
                    jenis_ukom,
                    jabatan,
                    jenjang,
                    isMengulang,
                )
            })
    }

    handleFormInitialization() {
        this.nonJFForm = new FormGroup({
            // Informasi Pribadi
            name: new FormControl('', Validators.required),
            nip: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{18}$/),
            ]),
            tanggalLahir: new FormControl('', Validators.required),
            phone: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{10,15}$/),
            ]),
            // Informasi Akun
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(8),
            ]),
            confirmPassword: new FormControl('', [
                Validators.required,
                this.passwordMatchValidator.bind(this),
            ]),

            // Informasi Jabatan & Unit Kerja
            jenis_instansi: new FormControl('', Validators.required),
            provinsi_id: new FormControl('', Validators.required),
            kabupaten_kota_id: new FormControl('', Validators.required),
            unitKerjaName: new FormControl('', Validators.required),
            jabatanName: new FormControl('', Validators.required),
            jenjangName: new FormControl(''),
            pangkatCode: new FormControl('', Validators.required),

            // Informasi Kenaikan Jabatan
            jenis_ukom: new FormControl('', Validators.required),
            nextJabatanCode: new FormControl('', Validators.required),
            nextJenjangCode: new FormControl('', Validators.required),
            bidang_jabatan_code: new FormControl(''),

            // Dokumen Pendukung
            no_surat_usulan: new FormControl('', Validators.required),
            tglSuratUsulan: new FormControl('', Validators.required),

            // Informasi Pendidikan
            pendidikan_terakhir_code: new FormControl('', Validators.required),
            jurusan: new FormControl('', Validators.required),

            // Penilaian Kinerja Pegawai
            predikat_kinerja_1_id: new FormControl('', Validators.required),
            predikat_kinerja_2_id: new FormControl('', Validators.required),

            isMengulang: new FormControl('', Validators.required),

            tempatLahir: new FormControl('', Validators.required),
            tmtJabatan: new FormControl('', Validators.required),
            tmtPangkat: new FormControl('', Validators.required),
        })
    }

    setupInstansiValidation() {
        this.nonJFForm
            .get('jenis_instansi')
            ?.valueChanges.subscribe((value) => {
                const provinsiControl = this.nonJFForm.get('provinsi_id')
                const kabupatenControl = this.nonJFForm.get('kabupaten_kota_id')

                // Reset Validasi
                provinsiControl?.clearValidators()
                kabupatenControl?.clearValidators()

                if (value === 'PEMERINTAH_PROVINSI') {
                    provinsiControl?.setValidators(Validators.required)
                } else if (value === 'PEMERINTAH_KABUPATEN_KOTA') {
                    provinsiControl?.setValidators(Validators.required)
                    kabupatenControl?.setValidators(Validators.required)
                }

                // Update Validasi
                provinsiControl?.updateValueAndValidity()
                kabupatenControl?.updateValueAndValidity()
            })

        this.bidangJabatanList$.subscribe((bidangList) => {
            const bidangJabatanControl = this.nonJFForm.get(
                'bidang_jabatan_code',
            )

            if (bidangList.length > 0) {
                this.nonJFForm.get('bidang_jabatan_code').setValue('')
                bidangJabatanControl?.setValidators(Validators.required)
            } else {
                this.nonJFForm.get('bidang_jabatan_code').setValue('')
                bidangJabatanControl?.clearValidators()
            }

            bidangJabatanControl?.updateValueAndValidity()
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

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.nonJFForm.get(controlName)

        if (
            !control ||
            !control.errors ||
            (!control.touched && !control.dirty)
        ) {
            return null // No error or untouched field
        }

        const errors = control.errors

        if (errors['required']) {
            return `${label} tidak boleh kosong.`
        }
        if (errors['email']) {
            return `Format ${label} tidak valid.`
        }
        if (errors['minlength']) {
            return `${label} minimal ${errors['minlength'].requiredLength} karakter.`
        }
        if (errors['pattern']) {
            if (controlName == 'nip') {
                return `${label} harus terdiri dari 18 digit angka.`
            }

            if (controlName == 'nik') {
                return `${label} harus terdiri dari 16 digit angka.`
            }

            if (controlName === 'phone') {
                return `${label} harus terdiri dari 10 hingga 15 digit angka.`
            }

            return `Format ${label} tidak valid.`
        }
        if (errors['mismatch']) {
            return `Password dan Konfirmasi Password tidak cocok.`
        }

        return null // Default case
    }

    getPredikatKinerja() {
        this.isPredikatKinerjaLoading$.next(true)
        this.apiService
            .getData('/api/v1/predikat_kinerja')
            .pipe(
                finalize(() => {
                    this.isPredikatKinerjaLoading$.next(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.predikatKinerjaList = res.map(
                        (predikat: { [key: string]: any }) =>
                            new PredikatKinerja(predikat),
                    )
                },
            })
    }

    getPendidikanList() {
        this.isPendidikanLoading$.next(true)
        this.apiService
            .getData(`/api/v1/pendidikan`)
            .pipe(
                finalize(() => {
                    this.isPendidikanLoading$.next(false)
                }),
            )
            .subscribe({
                next: (response) => {
                    this.pendidikanList = response.map(
                        (pendidikan: { [key: string]: any }) =>
                            new Pendidikan(pendidikan),
                    )
                },
            })
    }

    getProvinsi() {
        this.isProvinsiLoading$.next(true)
        this.apiService
            .getData(`/api/v1/provinsi`)
            .pipe(
                finalize(() => {
                    this.isProvinsiLoading$.next(false)
                }),
            )
            .subscribe({
                next: (response) =>
                    (this.provinsiList = response.map(
                        (provinsi: { [key: string]: any }) =>
                            new Provinsi(provinsi),
                    )),
            })
    }

    getKabKota(provinsiId: string | number) {
        forkJoin({
            kabupaten: this.apiService.getData(
                `/api/v1/kab_kota/type/KABUPATEN/${provinsiId}`,
            ),
            kota: this.apiService.getData(
                `/api/v1/kab_kota/type/KOTA/${provinsiId}`,
            ),
        }).subscribe({
            next: ({ kabupaten, kota }) => {
                this.kabKotaList = [
                    ...kabupaten.map((item: any) => new KabKota(item)),
                    ...kota.map((item: any) => new KabKota(item)),
                ]
            },
            error: (err) => {
                this.kabKotaList = []
            },
        })
    }

    passwordMatchValidator(
        control: FormControl,
    ): { [key: string]: boolean } | null {
        if (this.nonJFForm) {
            const password = this.nonJFForm.get('password')?.value
            const confirmPassword = control.value
            if (password !== confirmPassword) {
                return { mismatch: true }
            }
        }
        return null
    }

    isAnyFileMissing(): boolean {
        if (!this.inputs.files || Object.keys(this.inputs.files).length === 0) {
            return true
        }

        return Object.keys(this.inputs.files).some((key) => {
            return !this.detectedDokumen[key]
        })
    }

    backToLandingPage() {
        this.router.navigate([''])
    }

    getDokumenPersyaratan(
        jenis_ukom: string,
        jabatan: string,
        jenjang: string,
        isMengulang: boolean,
    ) {
        this.ukomDocumentService.getDocumentByJenisUkom(jenis_ukom)
        this.ukomDocumentService.documentByJenisUkom$
            .pipe(
                filter((docs) => docs.length > 0),
                map((docs) =>
                    docs
                        .filter((dokumen) => {
                            const specificationMatch =
                                dokumen.specification === null ||
                                dokumen.specification === 'non_jf' ||
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
                            (dokumen) =>
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
                next: (filteredList) => {
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
                error: (error) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil dokumen persyaratan',
                    )
                },
            })
        // this.apiService
        //     .getData(`/api/v1/document_ukom/jenis_ukom/${jenis_ukom}`)
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
        //                 // const key = `dokumenPersyaratan_${index + 1}`;
        //                 const key = dokumen.dokumenPersyaratanId
        //                 this.inputs.files[key] = {
        //                     label: dokumen.dokumenPersyaratanName,
        //                     id: dokumen.dokumenPersyaratanId,
        //                 }
        //             })
        //         },
        //         error: (error) => {
        //             this.handlerService.handleAlert(
        //                 'Error',
        //                 'Gagal mengambil dokumen persyaratan',
        //             )
        //         },
        //     })
    }

    getListJabatan() {
        this.jabatanList$ = this.apiService
            .getData(`/api/v1/jabatan`)
            .pipe(
                map((response) =>
                    response.map(
                        (jabatan: { [key: string]: any }) =>
                            new Jabatan(jabatan),
                    ),
                ),
            )
    }

    getListJenjang(jabatanCode: string) {
        if (!jabatanCode) {
            return
        }
        this.jenjangList$ = this.apiService
            .getData(`/api/v1/jenjang/jabatan/${jabatanCode}`)
            .pipe(
                map((response) =>
                    response.map(
                        (jenjang: { [key: string]: any }) =>
                            new Jenjang(jenjang),
                    ),
                ),
            )
    }

    getListPangkat() {
        this.pangkatList$ = this.apiService
            .getData(`/api/v1/pangkat`)
            .pipe(
                map((response) =>
                    response.map(
                        (pangkat: { [key: string]: any }) =>
                            new Pangkat(pangkat),
                    ),
                ),
            )
    }

    clearFilesName() {
        if (this.fileHandler) {
            this.fileHandler.clearFileName()
        }
    }

    onChangeURL(url: SafeUrl) {
        this.qrCodeDownloadLink = url
    }

    submit() {
        this.nonJFParticipantUkom = new NonJFParticipantUkomTask(
            this.nonJFForm.value,
        )

        this.nonJFParticipantUkom.jenjangName =
            this.nonJFForm.get('jenjangName')?.value || '-'
        this.nonJFParticipantUkom.isMengulang =
            String(this.nonJFForm.get('isMengulang')?.value) === 'true'
        if (!Array.isArray(this.nonJFParticipantUkom.dokumenUkomList)) {
            this.nonJFParticipantUkom.dokumenUkomList = []
        }

        // ✅ build dokumenUkomList
        const documentMap = new Map<string | number, DokumenUkom>()

        for (const key in this.detectedDokumen) {
            if (this.detectedDokumen.hasOwnProperty(key)) {
                const detected = this.detectedDokumen[key]

                const dokumenPersyaratan = this.dokumenPersyaratanList.find(
                    (dokumen) => dokumen.dokumenPersyaratanId === key,
                )

                if (dokumenPersyaratan) {
                    const newDoc = new DokumenUkom({
                        dokumenFile: detected.base64,
                        dokumenPersyaratanName: `${
                            dokumenPersyaratan.dokumenPersyaratanName
                        }_${this.nonJFParticipantUkom.nip}_${Date.now()}_${
                            dokumenPersyaratan.dokumenPersyaratanName
                        }`,
                        dokumenPersyaratanId: detected.id,
                    })

                    documentMap.set(detected.id, newDoc)
                }
            }
        }

        this.nonJFParticipantUkom.dokumenUkomList = Array.from(
            documentMap.values(),
        )

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.hadItemsLoading$.next(true)
                this.ukomParticipantService
                    .registerUkomParticipantNonJF(this.nonJFParticipantUkom)
                    .pipe(
                        finalize(() => {
                            this.hadItemsLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: (response) => {
                            this.registerComplete = true
                            this.stringCode = response.key
                            this.imageUrl = response.imageUrl
                            this.nonJFNIP = this.nonJFParticipantUkom.nip

                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                        },
                        error: () => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mendaftar UKom, silahkan coba lagi',
                            )
                        },
                    })
            },
        })
    }

    downloadImage(nip: string) {
        fetch(this.imageUrl)
            .then((response) => response.blob()) // Convert to Blob
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = blobUrl
                a.download = `${nip}-pendaftaran-ukom.jpg` // Set filename
                document.body.appendChild(a)
                a.click() // Auto-click to start download
                document.body.removeChild(a)
                window.URL.revokeObjectURL(blobUrl) // Cleanup
            })
            .catch((error) => console.error('Download failed:', error))
    }
}
