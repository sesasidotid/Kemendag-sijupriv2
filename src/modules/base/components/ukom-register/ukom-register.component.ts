import { PesertaUkom } from '../../../ukom/models/peserta-ukom.model'
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
    Validators
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
import {
    forkJoin,
    combineLatest,
    startWith,
    distinctUntilChanged,
    of
} from 'rxjs'
import { filter } from 'rxjs/operators'
import { PredikatKinerja } from '../../../maintenance/models/predikat-kinerja.model'
import { Pendidikan } from '../../../maintenance/models/pendidikan.model'
import { BidangJabatan } from '../../../maintenance/models/bidang-jabatan.model'

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
        LandingPageComponent
    ],
    templateUrl: './ukom-register.component.html',
    styleUrl: './ukom-register.component.scss'
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
    pesertaUkom: PesertaUkom = new PesertaUkom()
    dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

    provinsiList: Provinsi[] = []
    kabKotaList: KabKota[] = []
    predikatKinerjaList: PredikatKinerja[] = []
    pendidikanList: Pendidikan[] = []

    registerComplete: boolean = false
    registerOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    )

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
            id: string
        ) => {
            this.detectedDokumen[key] = {
                base64: base64Data,
                label: label,
                id: id
            }
        }
    }

    hadItemsLoading$ = new BehaviorSubject<boolean>(false)
    imageUrl: string = ''
    nonJFNIP: string

    isRegisterOpenLoading$ = new BehaviorSubject<boolean>(false)
    isPredikatKinerjaLoading$ = new BehaviorSubject<boolean>(false)
    isPendidikanLoading$ = new BehaviorSubject<boolean>(false)
    isProvinsiLoading$ = new BehaviorSubject<boolean>(false)
    isLoading$: Observable<boolean>

    constructor (
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {
        this.isLoading$ = combineLatest([
            this.isRegisterOpenLoading$,
            this.isPredikatKinerjaLoading$,
            this.isPendidikanLoading$,
            this.isProvinsiLoading$
        ]).pipe(map(loadings => loadings.some(isLoading => isLoading)))
    }

    ngOnInit () {
        this.checkStatusRegister()
        this.getListJabatan()
        this.getListJenjang()
        this.getListPangkat()
        this.getPredikatKinerja()
        this.getPendidikanList()
        this.getProvinsi()

        this.handleFormInitialization()
        this.setupInstansiValidation()
        this.handleFetchDokumenPersyaratan()
        this.handleSubscribe()
    }

    handleSubscribe () {
        this.nonJFForm.get('jenis_instansi')?.valueChanges.subscribe(value => {
            this.instansiSubject.next(value)
            this.nonJFForm.get('provinsi_id')?.setValue('')
            this.nonJFForm.get('kabupaten_kota_id')?.setValue('')
        })

        this.nonJFForm
            .get('provinsi_id')
            ?.valueChanges.subscribe(provinsiId => {
                if (provinsiId) {
                    this.nonJFForm.get('kabupaten_kota_id')?.setValue('')
                    this.getKabKota(provinsiId)
                } else {
                    this.kabKotaList = []
                }
            })

        this.nonJFForm.get('jenis_ukom')?.valueChanges.subscribe(value => {
            this.clearFilesName()
            this.nonJFForm.patchValue({
                nextJabatanCode: '',
                nextJenjangCode: ''
            })
            this.inputs.files = {}
            this.detectedDokumen = {}
        })

        this.nonJFForm.get('nextJabatanCode')?.valueChanges.subscribe(value => {
            this.nonJFForm.patchValue({
                bidang_jabatan_code: ''
            })
            this.getBidangJabatanByJabatanCode(value)
        })
    }

    handleFetchDokumenPersyaratan () {
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
                map(value =>
                    value === 'true' ? true : value === 'false' ? false : null
                )
            )
        ])
            .pipe(
                filter(
                    ([jenis_ukom, jabatan, jenjang, isMengulang]) =>
                        !!jenis_ukom &&
                        !!jabatan &&
                        !!jenjang &&
                        isMengulang !== null
                ),
                tap(() => {
                    this.clearFilesName()
                })
            )
            .subscribe(([jenis_ukom, jabatan, jenjang, isMengulang]) => {
                this.getDokumenPersyaratan(
                    jenis_ukom,
                    jabatan,
                    jenjang,
                    isMengulang
                )
            })
    }

    handleFormInitialization () {
        this.nonJFForm = new FormGroup({
            // Informasi Pribadi
            name: new FormControl('', Validators.required),
            nip: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{18}$/)
            ]),
            tanggalLahir: new FormControl('', Validators.required),
            phone: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{10,15}$/)
            ]),
            // Informasi Akun
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(8)
            ]),
            confirmPassword: new FormControl('', [
                Validators.required,
                this.passwordMatchValidator.bind(this)
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

            isMengulang: new FormControl('', Validators.required)
        })
    }

    setupInstansiValidation () {
        this.nonJFForm.get('jenis_instansi')?.valueChanges.subscribe(value => {
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

        this.bidangJabatanList$.subscribe(bidangList => {
            const bidangJabatanControl = this.nonJFForm.get(
                'bidang_jabatan_code'
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

    getBidangJabatanByJabatanCode (jabatanCode: string): void {
        this.bidangJabatanList$ = this.apiService
            .getData(`/api/v1/bidang_jabatan/jabatan/${jabatanCode}`)
            .pipe(
                map((res: any) =>
                    Array.isArray(res) && res.length > 0
                        ? res.map(
                              (bidangJabatan: { [key: string]: any }) =>
                                  new BidangJabatan(bidangJabatan)
                          )
                        : []
                ),
                startWith([])
            )
    }

    getErrorMessage (controlName: string, label: string): string | null {
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

    getPredikatKinerja () {
        this.isPredikatKinerjaLoading$.next(true)
        this.apiService
            .getData('/api/v1/predikat_kinerja')
            .pipe(
                finalize(() => {
                    this.isPredikatKinerjaLoading$.next(false)
                })
            )
            .subscribe({
                next: res => {
                    this.predikatKinerjaList = res.map(
                        (predikat: { [key: string]: any }) =>
                            new PredikatKinerja(predikat)
                    )
                }
            })
    }

    getPendidikanList () {
        this.isPendidikanLoading$.next(true)
        this.apiService
            .getData(`/api/v1/pendidikan`)
            .pipe(
                finalize(() => {
                    this.isPendidikanLoading$.next(false)
                })
            )
            .subscribe({
                next: response => {
                    this.pendidikanList = response.map(
                        (pendidikan: { [key: string]: any }) =>
                            new Pendidikan(pendidikan)
                    )
                }
            })
    }

    getProvinsi () {
        this.isProvinsiLoading$.next(true)
        this.apiService
            .getData(`/api/v1/provinsi`)
            .pipe(
                finalize(() => {
                    this.isProvinsiLoading$.next(false)
                })
            )
            .subscribe({
                next: response =>
                    (this.provinsiList = response.map(
                        (provinsi: { [key: string]: any }) =>
                            new Provinsi(provinsi)
                    ))
            })
    }

    getKabKota (provinsiId: string | number) {
        forkJoin({
            kabupaten: this.apiService.getData(
                `/api/v1/kab_kota/type/KABUPATEN/${provinsiId}`
            ),
            kota: this.apiService.getData(
                `/api/v1/kab_kota/type/KOTA/${provinsiId}`
            )
        }).subscribe({
            next: ({ kabupaten, kota }) => {
                this.kabKotaList = [
                    ...kabupaten.map((item: any) => new KabKota(item)),
                    ...kota.map((item: any) => new KabKota(item))
                ]
            },
            error: err => {
                this.kabKotaList = []
            }
        })
    }

    passwordMatchValidator (
        control: FormControl
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

    // !important
    isAnyFileMissing (): boolean {
        if (!this.inputs.files || Object.keys(this.inputs.files).length === 0) {
            return true
        }

        return Object.keys(this.inputs.files).some(key => {
            return !this.detectedDokumen[key]
        })
    }

    backToLandingPage () {
        this.router.navigate([''])
    }

    getDokumenPersyaratan (
        jenis_ukom: string,
        jabatan: string,
        jenjang: string,
        isMengulang: boolean
    ) {
        this.apiService
            .getData(`/api/v1/document_ukom/jenis_ukom/${jenis_ukom}`)
            .subscribe({
                next: response => {
                    this.dokumenPersyaratanList = response
                        .filter((dokumen: any) => {
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
                                jabatanMatch && jenjangMatch && isMengulangMatch
                            )
                        })
                        .map(
                            (dokumen: any) =>
                                new DokumenUkomPersyaratan({
                                    dokumenPersyaratanId:
                                        dokumen.dokumenPersyaratanId,
                                    dokumenPersyaratanName:
                                        dokumen.dokumenPersyaratanName
                                })
                        )

                    this.detectedDokumen = {}
                    this.inputs.files = {}

                    this.dokumenPersyaratanList.forEach((dokumen, index) => {
                        // const key = `dokumenPersyaratan_${index + 1}`;
                        const key = dokumen.dokumenPersyaratanId
                        this.inputs.files[key] = {
                            label: dokumen.dokumenPersyaratanName,
                            id: dokumen.dokumenPersyaratanId
                        }
                    })
                },
                error: error => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil dokumen persyaratan'
                    )
                }
            })
    }

    getListJabatan () {
        this.jabatanList$ = this.apiService
            .getData(`/api/v1/jabatan`)
            .pipe(
                map(response =>
                    response.map(
                        (jabatan: { [key: string]: any }) =>
                            new Jabatan(jabatan)
                    )
                )
            )
    }

    getListJenjang () {
        this.jenjangList$ = this.apiService
            .getData(`/api/v1/jenjang`)
            .pipe(
                map(response =>
                    response.map(
                        (jenjang: { [key: string]: any }) =>
                            new Jenjang(jenjang)
                    )
                )
            )
    }

    getListPangkat () {
        this.pangkatList$ = this.apiService
            .getData(`/api/v1/pangkat`)
            .pipe(
                map(response =>
                    response.map(
                        (pangkat: { [key: string]: any }) =>
                            new Pangkat(pangkat)
                    )
                )
            )
    }

    clearFilesName () {
        if (this.fileHandler) {
            this.fileHandler.clearFileName()
        }
    }

    onChangeURL (url: SafeUrl) {
        this.qrCodeDownloadLink = url
    }

    checkStatusRegister () {
        this.isRegisterOpenLoading$.next(true)

        this.apiService
            .getData(`/api/v1/sys_conf/UKM_REGISTRATION`)
            .pipe(
                finalize(() => {
                    this.isRegisterOpenLoading$.next(false)
                })
            )
            .subscribe({
                next: response => {
                    this.registerOpened$.next(response.value == 'ya')
                }
            })
    }

    submit () {
        const jenis_ukom = this.nonJFForm.get('jenis_ukom').value
        this.pesertaUkom.name = this.nonJFForm.get('name').value
        this.pesertaUkom.nip = this.nonJFForm.get('nip').value
        this.pesertaUkom.tanggalLahir = this.nonJFForm.get('tanggalLahir').value
        this.pesertaUkom.phone = this.nonJFForm.get('phone').value

        this.pesertaUkom.email = this.nonJFForm.get('email').value
        this.pesertaUkom.password = this.nonJFForm.get('password').value

        this.pesertaUkom.jenis_instansi =
            this.nonJFForm.get('jenis_instansi')?.value
        this.pesertaUkom.provinsi_id = this.nonJFForm.get('provinsi_id')?.value
        this.pesertaUkom.kabupaten_kota_id =
            this.nonJFForm.get('kabupaten_kota_id')?.value
        this.pesertaUkom.unitKerjaName =
            this.nonJFForm.get('unitKerjaName')?.value
        this.pesertaUkom.jabatanName = this.nonJFForm.get('jabatanName')?.value
        this.pesertaUkom.jenjangName =
            this.nonJFForm.get('jenjangName')?.value || '-'
        this.pesertaUkom.pangkatCode = this.nonJFForm.get('pangkatCode')?.value

        this.pesertaUkom.jenis_ukom = jenis_ukom
        this.pesertaUkom.nextJabatanCode =
            this.nonJFForm.get('nextJabatanCode')?.value
        this.pesertaUkom.nextJenjangCode =
            this.nonJFForm.get('nextJenjangCode')?.value
        this.pesertaUkom.bidang_jabatan_code = this.nonJFForm.get(
            'bidang_jabatan_code'
        )?.value

        this.pesertaUkom.no_surat_usulan =
            this.nonJFForm.get('no_surat_usulan')?.value
        this.pesertaUkom.tglSuratUsulan =
            this.nonJFForm.get('tglSuratUsulan')?.value

        this.pesertaUkom.pendidikanTerakhirCode = this.nonJFForm.get(
            'pendidikan_terakhir_code'
        )?.value
        this.pesertaUkom.jurusan = this.nonJFForm.get('jurusan')?.value

        this.pesertaUkom.predikat_kinerja_1_id = this.nonJFForm.get(
            'predikat_kinerja_1_id'
        )?.value
        this.pesertaUkom.predikat_kinerja_2_id = this.nonJFForm.get(
            'predikat_kinerja_2_id'
        )?.value

        this.pesertaUkom.isMengulang = this.nonJFForm.get('isMengulang')?.value

        if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
            this.pesertaUkom.dokumenUkomList = []
        }

        const documentMap = new Map()

        for (const key in this.detectedDokumen) {
            if (this.detectedDokumen.hasOwnProperty(key)) {
                const detected = this.detectedDokumen[key]

                const dokumenPersyaratan = this.dokumenPersyaratanList.find(
                    // dokumen => dokumen.dokumenPersyaratanName === detected.label
                    dokumen => dokumen.dokumenPersyaratanId === key
                )

                if (dokumenPersyaratan) {
                    const newDoc = {
                        dokumenFile: detected.base64,
                        dokumenPersyaratanName: `${
                            dokumenPersyaratan.dokumenPersyaratanName
                        }_${this.pesertaUkom.nip}_${Date.now()}_${
                            dokumenPersyaratan.dokumenPersyaratanName
                        }`,
                        dokumenPersyaratanId: detected.id
                    }

                    documentMap.set(detected.id, newDoc)
                }
            }
        }

        this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return

                this.hadItemsLoading$.next(true)

                this.apiService
                    .postData('/api/v1/participant_ukom/task', this.pesertaUkom)
                    .subscribe({
                        next: response => {
                            this.registerComplete = true
                            this.stringCode = response.key
                            this.imageUrl = response.imageUrl
                            this.nonJFNIP = this.pesertaUkom.nip

                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan'
                            )
                            this.hadItemsLoading$.next(false)
                        },
                        error: error => {
                            this.hadItemsLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mendaftar UKom, silahkan coba lagi'
                            )
                        }
                    })
            },
            error: error => {
                this.hadItemsLoading$.next(false)
                this.handlerService.handleAlert('Error', error.error.message)
            }
        })
    }

    downloadImage (nip: string) {
        fetch(this.imageUrl)
            .then(response => response.blob()) // Convert to Blob
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = blobUrl
                a.download = `${nip}-pendaftaran-ukom.jpg` // Set filename
                document.body.appendChild(a)
                a.click() // Auto-click to start download
                document.body.removeChild(a)
                window.URL.revokeObjectURL(blobUrl) // Cleanup
            })
            .catch(error => console.error('Download failed:', error))
    }
}
