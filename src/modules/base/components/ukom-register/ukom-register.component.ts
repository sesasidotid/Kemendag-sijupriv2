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
import { map } from 'rxjs/operators'
import { QRCodeModule } from 'angularx-qrcode'
import { SafeUrl } from '@angular/platform-browser'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
import { Router } from '@angular/router'
import { LandingPageComponent } from '../../../landing-page/landing-page.component'
import { BehaviorSubject } from 'rxjs'
import { KabKota } from '../../../maintenance/models/kab-kota.model'
import { Provinsi } from '../../../maintenance/models/provinsi.model'
import { forkJoin, combineLatest, startWith, distinctUntilChanged } from 'rxjs';
import { filter } from 'rxjs/operators';
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
    nextJenjang: Jenjang
    detectedDokumen: any = {}
    pesertaUkom: PesertaUkom = new PesertaUkom()
    dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

    provinsiList: Provinsi[] = []
    kabKotaList: KabKota[] = []

    registerComplete: boolean = false
    registerOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    )

    private instansiSubject = new BehaviorSubject<string>('');
    instansi$ = this.instansiSubject.asObservable();

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

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {
        setTimeout(() => { }, 0)
    }

    ngOnInit() {
        this.checkStatusRegister()
        this.handleFormInitialization()
        this.getListJabatan()
        this.getListJenjang()
        this.getListPangkat()
        this.getProvinsi()
        this.handleSubsrcibe()
        this.handleFetchDokumenPersyaratan()
    }

    handleSubsrcibe() {
        this.nonJFForm.valueChanges.subscribe(value => {
            console.log('form', value)
        });

        this.nonJFForm.get('jenis_instansi')?.valueChanges.subscribe(value => {
            this.instansiSubject.next(value);
            this.nonJFForm.get('provinsi')?.setValue('');
            this.nonJFForm.get('kabupatenkota')?.setValue('');
        });

        this.nonJFForm.get('provinsi')?.valueChanges.subscribe((provinsiId) => {
            if (provinsiId) {
                this.nonJFForm.get('kabupatenkota')?.setValue('');
                this.getKabKota(provinsiId);
            } else {
                this.kabKotaList = [];
            }
        });

        this.nonJFForm.get('jenis_ukom')?.valueChanges.subscribe(value => {
            this.clearFilesName();
            this.nonJFForm.patchValue({
                nextJabatanCode: '',
                nextJenjangCode: '',
            });
            this.inputs.files = {};
            this.detectedDokumen = {};
        });
    }

    handleFetchDokumenPersyaratan() {
        combineLatest([
            this.nonJFForm.get('jenis_ukom')!.valueChanges.pipe(startWith(null)),
            this.nonJFForm.get('nextJabatanCode')!.valueChanges.pipe(startWith(null)),
            this.nonJFForm.get('nextJenjangCode')!.valueChanges.pipe(startWith(null)),
        ])
            .pipe(
                filter(([jenis_ukom, jabatan, jenjang]) => !!jenis_ukom && !!jabatan && !!jenjang),
                distinctUntilChanged(([prevJenis, prevJabatan, prevJenjang], [currJenis, currJabatan, currJenjang]) =>
                    prevJenis === currJenis && prevJabatan === currJabatan && prevJenjang === currJenjang
                )
            )
            .subscribe(([jenis_ukom, jabatan, jenjang]) => {
                console.log('Fetching dokumen for:', { jenis_ukom, jabatan, jenjang });
                this.getDokumenPersyaratan(jenis_ukom, jabatan, jenjang);
            });
    }

    handleFormInitialization() {
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
            provinsi: new FormControl('', Validators.required),
            kabupatenkota: new FormControl('', Validators.required),
            instansiCode: new FormControl('', Validators.required),
            unitKerjaName: new FormControl('', Validators.required),
            jabatanName: new FormControl('', Validators.required),
            jenjangName: new FormControl(''),
            pangkatCode: new FormControl('', Validators.required),

            // Informasi Kenaikan Jabatan
            jenis_ukom: new FormControl('', Validators.required),
            nextJabatanCode: new FormControl('', Validators.required),
            nextJenjangCode: new FormControl('', Validators.required),

            // Dokumen Pendukung
            nomorSuratUsulan: new FormControl('', Validators.required),
            tglSuratUsulan: new FormControl('', Validators.required),

            // Informasi Pendidikan
            pendidikanTerakhir: new FormControl('', Validators.required),
            jurusan: new FormControl('', Validators.required),

            // Penilaian Kinerja Pegawai
            predikatKinerjaTahunPertama: new FormControl('', Validators.required),
            predikatKinerjaTahunKedua: new FormControl('', Validators.required),
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.nonJFForm.get(controlName);

        if (!control || !control.errors || (!control.touched && !control.dirty)) {
            return null; // No error or untouched field
        }

        const errors = control.errors;

        if (errors['required']) {
            return `${label} tidak boleh kosong.`;
        }
        if (errors['email']) {
            return `Format ${label} tidak valid.`;
        }
        if (errors['minlength']) {
            return `${label} minimal ${errors['minlength'].requiredLength} karakter.`;
        }
        if (errors['pattern']) {
            if (controlName == 'nip') {
                return `${label} harus terdiri dari 18 digit angka.`;
            }

            if (controlName == 'nik') {
                return `${label} harus terdiri dari 16 digit angka.`;
            }

            if (controlName === 'phone') {
                return `${label} harus terdiri dari 10 hingga 15 digit angka.`;
            }

            return `Format ${label} tidak valid.`;
        }
        if (errors['mismatch']) {
            return `Password dan Konfirmasi Password tidak cocok.`;
        }

        return null; // Default case
    }

    getProvinsi() {
        this.apiService.getData(`/api/v1/provinsi`).subscribe({
            next: response =>
            (this.provinsiList = response.map(
                (provinsi: { [key: string]: any }) => new Provinsi(provinsi)
            )),
        })
    }

    getKabKota(provinsiId: string | number) {
        forkJoin({
            kabupaten: this.apiService.getData(`/api/v1/kab_kota/type/KABUPATEN/${provinsiId}`),
            kota: this.apiService.getData(`/api/v1/kab_kota/type/KOTA/${provinsiId}`)
        }).subscribe({
            next: ({ kabupaten, kota }) => {
                this.kabKotaList = [
                    ...kabupaten.map((item: any) => new KabKota(item)),
                    ...kota.map((item: any) => new KabKota(item))
                ];
            },
            error: (err) => {
                console.error('Error fetching Kabupaten/Kota:', err);
                this.kabKotaList = [];
            }
        });
    }

    passwordMatchValidator(
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

    isAnyFileMissing(): boolean {
        return Object.keys(this.inputs.files).some(key => {
            return !this.detectedDokumen[key]
        })
    }

    backToLandingPage() {
        this.router.navigate([''])
    }

    getDokumenPersyaratan(jenis_ukom: string, jabatan: string, jenjang: string) {
        this.apiService
            .getData(`/api/v1/document_ukom/jenis_ukom/${jenis_ukom}`)
            .subscribe({
                next: response => {
                    this.dokumenPersyaratanList = response.filter((dokumen: any) => {
                        const jabatanMatch = !dokumen.jabatanCode || dokumen.jabatanCode === jabatan;
                        const jenjangMatch = !dokumen.jenjangCode || dokumen.jenjangCode === jenjang;
                        return jabatanMatch && jenjangMatch;
                    }).map((dokumen: any) => new DokumenUkomPersyaratan({
                        dokumenPersyaratanId: dokumen.dokumenPersyaratanId,
                        dokumenPersyaratanName: dokumen.dokumenPersyaratanName
                    }));

                    this.detectedDokumen = {};
                    this.inputs.files = {};

                    this.dokumenPersyaratanList.forEach((dokumen, index) => {
                        const key = `dokumenPersyaratan_${index + 1}`;
                        this.inputs.files[key] = {
                            label: dokumen.dokumenPersyaratanName,
                            id: dokumen.dokumenPersyaratanId
                        };
                    });
                },
                error: error => {
                    console.log(error);
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil dokumen persyaratan'
                    );
                }
            });
    }


    // getDokumenPersyaratan(jenis_ukom: string, jabatan: string, jenjang: string) {
    //     this.apiService
    //         .getData(`/api/v1/document_ukom/jenis_ukom/${jenis_ukom}`)
    //         .subscribe({
    //             next: response => {
    //                 this.dokumenPersyaratanList = response.map((dokumen: any) => {
    //                     return new DokumenUkomPersyaratan({
    //                         dokumenPersyaratanId: dokumen.dokumenPersyaratanId,
    //                         dokumenPersyaratanName: dokumen.dokumenPersyaratanName
    //                     })
    //                 })

    //                 this.detectedDokumen = {}
    //                 this.inputs.files = {}

    //                 this.dokumenPersyaratanList.forEach((dokumen, index) => {
    //                     const key = `dokumenPersyaratan_${index + 1}`
    //                     this.inputs.files[key] = {
    //                         label: dokumen.dokumenPersyaratanName,
    //                         id: dokumen.dokumenPersyaratanId
    //                     }
    //                 })
    //             },
    //             error: error => {
    //                 console.log(error)
    //                 this.handlerService.handleAlert(
    //                     'Error',
    //                     'Gagal mengambil dokumen persyaratan'
    //                 )
    //             }
    //         })
    // }

    getListJabatan() {
        this.jabatanList$ = this.apiService
            .getData(`/api/v1/jabatan`)
            .pipe(
                map(response =>
                    response.map(
                        (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
                    )
                )
            )
    }

    getListJenjang() {
        this.jenjangList$ = this.apiService
            .getData(`/api/v1/jenjang`)
            .pipe(
                map(response =>
                    response.map(
                        (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
                    )
                )
            )
    }

    getListPangkat() {
        this.pangkatList$ = this.apiService
            .getData(`/api/v1/pangkat`)
            .pipe(
                map(response =>
                    response.map(
                        (pangkat: { [key: string]: any }) => new Pangkat(pangkat)
                    )
                )
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

    checkStatusRegister() {
        this.apiService.getData(`/api/v1/sys_conf/UKM_REGISTRATION`).subscribe({
            next: response => {
                this.registerOpened$.next(response.value == 'ya')
            }
        })
    }

    submit() {
        const jenis_ukom = this.nonJFForm.get('jenis_ukom').value
        this.pesertaUkom.name = this.nonJFForm.get('name').value
        this.pesertaUkom.email = this.nonJFForm.get('email').value
        this.pesertaUkom.password = this.nonJFForm.get('password').value
        this.pesertaUkom.nip = this.nonJFForm.get('nip').value
        this.pesertaUkom.unitKerjaName = this.nonJFForm.get('unitKerjaName')?.value
        this.pesertaUkom.jenis_ukom = jenis_ukom
        this.pesertaUkom.jabatanName = this.nonJFForm.get('jabatanName')?.value
        this.pesertaUkom.jenjangName =
            this.nonJFForm.get('jenjangName')?.value || '-'
        this.pesertaUkom.pangkatCode = this.nonJFForm.get('pangkatCode')?.value
        this.pesertaUkom.nextJabatanCode =
            this.nonJFForm.get('nextJabatanCode')?.value
        this.pesertaUkom.nextJenjangCode =
            this.nonJFForm.get('nextJenjangCode')?.value

        if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
            this.pesertaUkom.dokumenUkomList = []
        }

        const documentMap = new Map()

        for (const key in this.detectedDokumen) {
            if (this.detectedDokumen.hasOwnProperty(key)) {
                const detected = this.detectedDokumen[key]

                const dokumenPersyaratan = this.dokumenPersyaratanList.find(
                    dokumen => dokumen.dokumenPersyaratanName === detected.label
                )

                if (dokumenPersyaratan) {
                    const newDoc = {
                        dokumenFile: detected.base64,
                        dokumenPersyaratanName: `${dokumenPersyaratan.dokumenPersyaratanName
                            }_${this.pesertaUkom.nip}_${Date.now()}`,
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

                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan'
                            )
                            this.hadItemsLoading$.next(false)
                        },
                        error: error => {
                            this.hadItemsLoading$.next(false)
                            console.log('error', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mendaftar UKom, silahkan coba lagi'
                            )
                        }
                    })
            },
            error: error => {
                this.hadItemsLoading$.next(false)
                console.log('error', error)
                this.handlerService.handleAlert('Error', error.error.message)
            }
        })
    }

    downloadImage() {
        fetch(this.imageUrl)
            .then(response => response.blob()) // Convert to Blob
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = blobUrl
                a.download = 'sample-image.jpg' // Set filename
                document.body.appendChild(a)
                a.click() // Auto-click to start download
                document.body.removeChild(a)
                window.URL.revokeObjectURL(blobUrl) // Cleanup
            })
            .catch(error => console.error('Download failed:', error))
    }
}
