import { Component, inject, ViewChild } from '@angular/core'
import { Jabatan } from '../../../maintenance/models/jabatan.model'
import { Jenjang } from '../../../maintenance/models/jenjang.modle'
import { Pangkat } from '../../../maintenance/models/pangkat.model'
import { FileHandlerComponent } from '../file-handler/file-handler.component'
import {
    FormBuilder,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import {
    BehaviorSubject,
    combineLatest,
    forkJoin,
    Observable,
    startWith,
} from 'rxjs'
import { DokumenUkomPersyaratan } from '../../../maintenance/models/dokumen-persyaratan-ukom'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { ApiService } from '../../services/api.service'
import { HandlerService } from '../../services/handler.service'
import { ConfirmationService } from '../../services/confirmation.service'
import { CommonModule } from '@angular/common'
import { filter, finalize, map, tap } from 'rxjs/operators'
import { QRCodeModule } from 'angularx-qrcode'
import { Router, RouterModule } from '@angular/router'
import { LandingPageComponent } from '../../../landing-page/landing-page.component'
import { KabKota } from '../../../maintenance/models/kab-kota.model'
import { Provinsi } from '../../../maintenance/models/provinsi.model'
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
        LandingPageComponent,
        RouterModule,
    ],
    templateUrl: './ukom-register.component.html',
    styleUrl: './ukom-register.component.scss',
})
export class UkomRegisterComponent {
    formBuilder = inject(FormBuilder)
    nonJFForm = this.formBuilder.group({
        // Informasi Pribadi
        name: ['', Validators.required],
        nip: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]],
        tanggalLahir: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],

        // Informasi Akun
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: [
            '',
            [Validators.required, this.passwordMatchValidator.bind(this)],
        ],

        // Informasi Jabatan & Unit Kerja
        jenisInstansi: ['', Validators.required],
        provinsiId: ['', Validators.required],
        kabupatenKotaId: ['', Validators.required],
        unitKerjaName: ['', Validators.required],
        jabatanName: ['', Validators.required],
        jenjangName: [''],
        pangkatCode: ['', Validators.required],

        // Informasi Kenaikan Jabatan
        jenisUkom: ['', Validators.required],
        nextJabatanCode: ['', Validators.required],
        nextJenjangCode: ['', Validators.required],
        bidangJabatanCode: [''],

        // Dokumen Pendukung
        noSuratUsulan: ['', Validators.required],
        tglSuratUsulan: ['', Validators.required],

        // Informasi Pendidikan
        pendidikanTerakhirCode: ['', Validators.required],
        jurusan: ['', Validators.required],

        // Penilaian Kinerja Pegawai
        predikatKinerja1Id: ['', Validators.required],
        predikatKinerja2Id: ['', Validators.required],

        isMengulang: ['', Validators.required],

        tempatLahir: ['', Validators.required],
        tmtJabatan: ['', Validators.required],
        tmtPangkat: ['', Validators.required],
    })

    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent

    jabatanList$: Observable<Jabatan[]>
    jenjangList$: Observable<Jenjang[]>
    pangkatList$: Observable<Pangkat[]>
    NextjabatanList$: Observable<Jabatan[]>
    bidangJabatanList$ = new BehaviorSubject<BidangJabatan[]>([])
    nextJenjang: Jenjang
    detectedDokumen: any = {}
    nonJFParticipantUkom: NonJFParticipantUkomTask
    dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

    provinsiList: Provinsi[] = []
    kabKotaList: KabKota[] = []
    predikatKinerjaList: PredikatKinerja[] = []
    pendidikanList: Pendidikan[] = []

    registerComplete = false
    stringCode: string = ''
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
    imageUrl = ''
    isImageLoading = true
    nonJFNIP: string
    isRegisterOpenLoading$ = new BehaviorSubject<boolean>(false)
    isPredikatKinerjaLoading$ = new BehaviorSubject<boolean>(false)
    isPendidikanLoading$ = new BehaviorSubject<boolean>(false)
    isProvinsiLoading$ = new BehaviorSubject<boolean>(false)
    isLoading$: Observable<boolean>
    jenisInstansiList = [
        { value: 'KEMENTERIAN_PERDAGANGAN', label: 'Kementerian Perdagangan' },
        {
            value: 'KEMENTERIAN_PERINDUSTRIAN',
            label: 'Kementerian Perindustrian',
        },
        { value: 'KEMENTERIAN_ESDM', label: 'Kementerian ESDM' },
        {
            value: 'KEMENTERIAN_KOORDINATOR_BIDANG_PANGAN',
            label: 'Kementerian Koordinator Bidang Pangan',
        },
        { value: 'KEMENTERIAN_PERHUBUNGAN', label: 'Kementerian Perhubungan' },
        { value: 'KEMENTERIAN_PERTANIAN', label: 'Kementerian Pertanian' },
        {
            value: 'BADAN_STANDARISASI_NASIONAL',
            label: 'Badan Standarisasi Nasional',
        },
        { value: 'PEMERINTAH_PROVINSI', label: 'Pemerintah Provinsi' },
        {
            value: 'PEMERINTAH_KABUPATEN_KOTA',
            label: 'Pemerintah Kabupaten/Kota',
        },
    ]
    isCopied = false
    private instansiSubject = new BehaviorSubject<string>('')
    instansi$ = this.instansiSubject.asObservable()

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

    onLoad() {
        this.isImageLoading = false
    }

    onError() {
        this.isImageLoading = false
        this.imageUrl = ''
    }

    ngOnInit() {
        this.systemConfigService.checkUkomRegistration()
        this.getListJabatan()
        this.getListPangkat()
        this.getPredikatKinerja()
        this.getPendidikanList()
        this.getProvinsi()

        this.setupInstansiValidation()
        this.handleFetchDokumenPersyaratan()
        this.handleSubscribe()
    }

    handleSubscribe() {
        this.nonJFForm.get('jenisInstansi')?.valueChanges.subscribe((value) => {
            this.instansiSubject.next(value)
            this.nonJFForm.get('provinsiId')?.setValue('')
            this.nonJFForm.get('kabupatenKotaId')?.setValue('')
        })

        this.nonJFForm
            .get('provinsiId')
            ?.valueChanges.subscribe((provinsiId) => {
                if (provinsiId) {
                    this.nonJFForm.get('kabupatenKotaId')?.setValue('')
                    this.getKabKota(provinsiId)
                } else {
                    this.kabKotaList = []
                }
            })

        this.nonJFForm.get('jenisUkom')?.valueChanges.subscribe((value) => {
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
                // Reset dependent fields whenever target jabatan changes
                this.nonJFForm.patchValue({
                    nextJenjangCode: '',
                    bidangJabatanCode: '',
                })
                // Clear current bidang list so UI/validators update immediately
                this.bidangJabatanList$.next([])
                this.getBidangJabatanByJabatanCode(value)
                this.getListJenjang(value)
            })
    }

    handleFetchDokumenPersyaratan() {
        combineLatest([
            this.nonJFForm.get('jenisUkom')!.valueChanges.pipe(startWith(null)),
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

    setupInstansiValidation() {
        this.nonJFForm.get('jenisInstansi')?.valueChanges.subscribe((value) => {
            const provinsiControl = this.nonJFForm.get('provinsiId')
            const kabupatenControl = this.nonJFForm.get('kabupatenKotaId')

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
            const bidangJabatanControl = this.nonJFForm.get('bidangJabatanCode')

            if (bidangList.length > 0) {
                this.nonJFForm.get('bidangJabatanCode').setValue('')
                bidangJabatanControl?.setValidators(Validators.required)
            } else {
                this.nonJFForm.get('bidangJabatanCode').setValue('')
                bidangJabatanControl?.clearValidators()
            }

            bidangJabatanControl?.updateValueAndValidity()
        })
    }

    getBidangJabatanByJabatanCode(jabatanCode: string): void {
        if (!jabatanCode) {
            // Clear when no jabatan is selected
            this.bidangJabatanList$.next([])
            return
        }

        this.apiService
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
            .subscribe({
                next: (list) => this.bidangJabatanList$.next(list),
                error: () => this.bidangJabatanList$.next([]),
            })
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
                                dokumen.specification === 'null' ||
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
            .then((response) => response.blob())
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = blobUrl
                a.download = `${nip}-pendaftaran-ukom.jpg`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(blobUrl)
            })
            .catch((error) => {
                console.error('Download failed:', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengunduh gambar QR Code, silahkan coba lagi',
                )
            })
    }

    copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            this.isCopied = true
            setTimeout(() => {
                this.isCopied = false
            }, 2000)
        })
    }
}
