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
    Validators
} from '@angular/forms'
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, of, startWith, Subject, takeUntil, tap } from 'rxjs'
import { BidangJabatan } from '../../../modules/maintenance/models/bidang-jabatan.model'

@Component({
    selector: 'app-ukom-task-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './ukom-task-form.component.html',
    styleUrl: './ukom-task-form.component.scss'
})
export class UkomTaskFormComponent {
    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent
    @Input() jf: JF
    @Input() ukom: Ukom = new Ukom()

    pesertaUkom: PesertaUkom = new PesertaUkom()
    jabatanList: Jabatan[] = []
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
    destroy$ = new Subject<void>();
    isMengulang$ = new BehaviorSubject<boolean>(false);
    jabatanCodeArgument$ = new BehaviorSubject<string | null>(null);
    jenjangCodeArgument$ = new BehaviorSubject<string | null>(null);
    jenisUkom$ = new BehaviorSubject<string | null>(null);
    bidangJabatanList$: Observable<BidangJabatan[]> = of([]);

    pendidikanJF: string = ''
    jurusanJF: string = ''

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) { }

    ngOnInit() {
        this.handleFormInit()
        this.handleSubscribe()
        this.setupInstansiValidation()
        this.handleFetchDokumenPersyaratan()
        this.getJFPendidikan()
        this.getLast2TahunPredikatJF()

        this.passwordForm.valueChanges.subscribe(value => {
            console.log(value)
        })
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleFormInit() {
        this.passwordForm = new FormGroup({
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(8)
            ]),
            confirmPassword: new FormControl('', [
                Validators.required,
                this.passwordMatchValidator.bind(this)
            ]),
            isMengulang: new FormControl('', [Validators.required]),
            bidang_jabatan_code: new FormControl(''),
            // Dokumen Pendukung
            no_surat_usulan: new FormControl('', Validators.required),
            tglSuratUsulan: new FormControl('', Validators.required),
        })
    }

    setupInstansiValidation() {
        this.bidangJabatanList$.pipe(takeUntil(this.destroy$)).subscribe(bidangList => {
            const bidangJabatanControl = this.passwordForm.get('bidang_jabatan_code');

            if (bidangList.length > 0) {
                bidangJabatanControl?.setValidators(Validators.required);
            } else {
                bidangJabatanControl?.clearValidators();
            }

            bidangJabatanControl?.updateValueAndValidity();
        });

    }

    handleFetchDokumenPersyaratan() {
        combineLatest([
            this.jenisUkom$.pipe(startWith(null)),
            this.jabatanCodeArgument$.pipe(startWith(null)),
            this.jenjangCodeArgument$.pipe(startWith(null)),
            this.isMengulang$.pipe(startWith(null, map(value => value === 'true' ? true : value === 'false' ? false : null)))
        ])
            .pipe(
                tap(([jenisUkom, jabatanCode, JenjangCode, isMengulang]) => {
                    console.log('fetching dokumen persyaratan', jenisUkom, jabatanCode, JenjangCode, isMengulang)
                }),
                filter(([jenisUkom, jabatanCode, JenjangCode, isMengulang]) => !!jenisUkom && !!jabatanCode && !!JenjangCode && isMengulang !== null),
                tap(() => { this.clearFilesName() })
                // distinctUntilChanged(([prevJenis, prevJabatan, prevJenjang, prevIsMengulang], [currJenis, currJabatan, currJenjang, currIsMengulang]) =>
                //     prevJenis === currJenis && prevJabatan === currJabatan && prevJenjang === currJenjang && prevIsMengulang === currIsMengulang
                // )
            )
            .subscribe(([jenisUkom, jabatanCode, JenjangCode, isMengulang]) => {
                this.getDokumenPersyaratan(jenisUkom, jabatanCode, JenjangCode, isMengulang);
            });
    }

    getBidangJabatanByJabatanCode(jabatanCode: string): void {
        console.log('getBidangJabatanByJabatanCode')
        this.bidangJabatanList$ = this.apiService.getData(`/api/v1/bidang_jabatan/jabatan/${jabatanCode}`).pipe(
            map((res: any) =>
                Array.isArray(res) && res.length > 0
                    ? res.map((bidangJabatan: { [key: string]: any }) => new BidangJabatan(bidangJabatan))
                    : []
            ),
            startWith([])
        );
    }

    handleSubscribe() {
        this.passwordForm.get('isMengulang')?.valueChanges
            .pipe(
                takeUntil(this.destroy$),
                map(value => value === 'true' ? true : value === 'false' ? false : null)
            )
            .subscribe(value => {
                this.isMengulang$.next(value);
            });
    }


    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.passwordForm.get(controlName);

        if (!control || !control.errors || (!control.touched && !control.dirty)) {
            return null;
        }

        const errors = control.errors;

        if (errors['required']) {
            return `${label} tidak boleh kosong.`;
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

        return null;
    }

    passwordMatchValidator(
        control: FormControl
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

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ukom']) {
            console.log('Ukom changed:', changes['ukom'].currentValue)
        }
        if (changes['jf']) {
            console.log('JF changed:', changes['jf'].currentValue)
        }
    }

    getDokumenPersyaratan(jenisUkom: string, jabatan: string, jenjang: string, isMengulang: boolean,) {
        this.apiService
            .getData(
                `/api/v1/document_ukom/jenis_ukom/${jenisUkom}`
            )
            .subscribe({
                next: response => {
                    this.dokumenPersyaratanList =
                        response.filter((dokumen: any) => {
                            const jabatanMatch = !dokumen.jabatanCode || dokumen.jabatanCode === jabatan;
                            const jenjangMatch = !dokumen.jenjangCode || dokumen.jenjangCode === jenjang;
                            const isMengulangMatch = isMengulang ? true : dokumen.isMengulang === false;

                            return jabatanMatch && jenjangMatch && isMengulangMatch;
                        }).map((dokumen: any) => new DokumenUkomPersyaratan({
                            dokumenPersyaratanId: dokumen.dokumenPersyaratanId,
                            dokumenPersyaratanName: dokumen.dokumenPersyaratanName
                        }));

                    this.detectedDokumen = {}
                    this.inputs.files = {}

                    this.dokumenPersyaratanList.forEach((dokumen, index) => {
                        const key = `dokumenPersyaratan_${index + 1}`
                        this.inputs.files[key] = {
                            label: dokumen.dokumenPersyaratanName,
                            id: dokumen.dokumenPersyaratanId
                        }
                    })
                },
                error: error => this.handlerService.handleException(error)
            })
    }

    getNextJenjang() {
        this.apiService
            .getData(`/api/v1/jenjang/next/${this.jf.jenjangCode}`)
            .subscribe({
                next: response => {
                    this.nextJenjang = new Jenjang(response)
                    this.pesertaUkom.nextJenjangCode = this.nextJenjang.code
                    this.jabatanCodeArgument$.next(this.jf.jabatanCode)
                    this.jenjangCodeArgument$.next(this.pesertaUkom.nextJenjangCode)
                    // this.getDokumenPersyaratan(this.jf.jabatanCode, this.pesertaUkom.nextJenjangCode, this.isMengulang$.value)
                },
                error: error => this.handlerService.handleException(error)
            })
    }

    isAnyFileMissing(): boolean {
        return Object.keys(this.inputs.files).some(key => {
            return !this.detectedDokumen[key]
        })
    }

    getJFPendidikan() {
        this.apiService.getData(`/api/v1/rw_pendidikan/search?page=1&limit=100`).subscribe({
            next: res => {
                const lastItem = res.data[res.data.length - 1];
                if (lastItem) {
                    this.pendidikanJF = lastItem.pendidikanCode;
                    this.jurusanJF = lastItem.jurusan;
                }
            }
        })
    }

    getLast2TahunPredikatJF() {
        this.apiService.getData(`/api/v1/rw_kinerja/search?limit=1000&eq_type=tahunan`).subscribe({
            next: res => {
                const last2Tahun = res.data.slice(-2);
                console.log('last2Tahun', last2Tahun);

                if (last2Tahun.length === 1) {
                    // If only one record, assign it to predikat_kinerja_1_id
                    this.pesertaUkom.predikat_kinerja_1_id = last2Tahun[0]?.predikatKinerjaId ?? null;
                    this.pesertaUkom.predikat_kinerja_2_id = null;
                } else if (last2Tahun.length === 2) {
                    // If two records, assign the latest to predikat_kinerja_1_id and the previous to predikat_kinerja_2_id
                    this.pesertaUkom.predikat_kinerja_1_id = last2Tahun[1]?.predikatKinerjaId ?? null;
                    this.pesertaUkom.predikat_kinerja_2_id = last2Tahun[0]?.predikatKinerjaId ?? null;
                } else {
                    // If no records, assign null
                    this.pesertaUkom.predikat_kinerja_1_id = null;
                    this.pesertaUkom.predikat_kinerja_2_id = null;
                }

            }
        });
    }


    getListJabatan() {
        this.apiService
            .getData(`/api/v1/jabatan`)
            .subscribe({
                next: response =>
                (this.jabatanList = response.map(
                    (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
                )),
                error: error => this.handlerService.handleException(error)
            })
    }

    onJenisUkomSwitch(event: Event) {
        this.clearFilesName()
        this.detectedDokumen = {}
        this.inputs.files = {}
        this.passwordForm.get('bidang_jabatan_code').setValue('')
        this.bidangJabatanList$ = of([]);

        const jenis_ukom = (event.target as HTMLSelectElement).value

        this.pesertaUkom.nextJabatanCode = null
        this.pesertaUkom.nextJenjangCode = null
        this.jabatanCodeArgument$.next(null)
        this.jenjangCodeArgument$.next(null)
        this.isMengulang$.next(false)

        if (
            jenis_ukom == 'PERPINDAHAN_JABATAN' ||
            jenis_ukom == 'KENAIKAN_JENJANG'
        ) {
            this.pesertaUkom.jenis_ukom = jenis_ukom
            this.jenisUkom$.next(jenis_ukom)

            if (jenis_ukom == 'PERPINDAHAN_JABATAN') {
                this.getListJabatan()
            }
            if (jenis_ukom == 'KENAIKAN_JENJANG') {
                this.getNextJenjang()

            }

            console.log('jenis_ukom', this.pesertaUkom)
            console.log('jenis_ukomJF', this.jf)
        } else {
            this.pesertaUkom.jenis_ukom = null
            this.detectedDokumen = {}
            this.inputs.files = {}
        }
        console.log('jenis_ukom', this.pesertaUkom.jenis_ukom)
    }

    onNextJabatanSwitch(event: Event) {
        const nextJabatanCode = (event.target as HTMLSelectElement).value

        if (nextJabatanCode) {
            console.log('next', nextJabatanCode)
            this.passwordForm.get('bidang_jabatan_code').setValue('')
            this.getBidangJabatanByJabatanCode(nextJabatanCode);
            this.pesertaUkom.nextJabatanCode = nextJabatanCode
            this.jabatanCodeArgument$.next(this.pesertaUkom.nextJabatanCode)
            this.jenjangCodeArgument$.next(this.jf.jenjangCode)
        }
    }

    submit() {
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
                            }_${this.jf.nip}_${Date.now()}`,
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

                this.pesertaUkom.nip = this.jf.nip
                if (this.pesertaUkom.jenis_ukom == 'PERPINDAHAN_JABATAN') {
                    this.pesertaUkom.nextJenjangCode = this.jf.jenjangCode
                }

                if (this.pesertaUkom.jenis_ukom == 'KENAIKAN_JENJANG') {
                    this.pesertaUkom.nextJabatanCode = this.jf.jabatanCode
                }

                this.pesertaUkom.nextPangkatCode = this.jf.pangkatCode
                this.pesertaUkom.password = this.passwordForm.get('password')?.value
                this.pesertaUkom.bidang_jabatan_code =
                    this.passwordForm.get('bidang_jabatan_code')?.value

                this.pesertaUkom.no_surat_usulan = this.passwordForm.get('no_surat_usulan')?.value
                this.pesertaUkom.tglSuratUsulan = this.passwordForm.get('tglSuratUsulan')?.value

                this.pesertaUkom.tanggalLahir = this.jf.tanggalLahir
                this.pesertaUkom.pendidikanTerakhirCode = this.pendidikanJF
                this.pesertaUkom.jurusan = this.jurusanJF
                this.pesertaUkom.JenjangName = this.jf.jenjangName

                console.log('body', this.pesertaUkom)

                this.apiService
                    .postData(`/api/v1/participant_ukom/task/jf`, this.pesertaUkom)
                    .subscribe({
                        next: () => {
                            this.hadItemsLoading$.next(false)
                            window.location.reload()
                        },
                        error: error => {
                            this.hadItemsLoading$.next(false)
                            this.handlerService.handleException(error)
                        }
                    })
            },
            error: error => {
                console.log('error', error)
                this.handlerService.handleAlert('Error', error.error.message)
                this.hadItemsLoading$.next(false)
            }
        })
    }
}
