import { FilePreviewComponent } from './../file-preview/file-preview.component'
import { Component } from '@angular/core'
import { UkomTaskDetail } from '../../../ukom/models/ukom-task-detail.modal'
import { BehaviorSubject, Observable } from 'rxjs'
import { LoginContext } from '../../commons/login-context'
import { ModalComponent } from '../modal/modal.component'
import { UkomRevisionComponent } from '../../../../sijupri-jf/ukom/ukom-revision/ukom-revision.component'
import { CommonModule } from '@angular/common'
import { ConverterService } from '../../services/converter.service'
import { ApiService } from '../../services/api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { NonjfRevisiUkomComponent } from '../nonjf-revisi-ukom/nonjf-revisi-ukom.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { EmptyStateComponent } from '../empty-state/empty-state.component'
import { LandingPageComponent } from '../../../landing-page/landing-page.component'
import { CATSchore } from '../../../../modules/ukom/models/cat/cat-schore'
import { DataDokumenUkom } from '../../../../modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'

export enum JenisUkomEnum {
    PERPINDAHAN_JABATAN = 'Perpindahan Jabatan',
    KENAIKAN_JENJANG = 'Kenaikan Jenjang',
    PROMOSI = 'Promosi'
}
@Component({
    selector: 'app-status-pendaftaran-ukom',
    standalone: true,
    imports: [
        ModalComponent,
        CommonModule,
        NonjfRevisiUkomComponent,
        EmptyStateComponent,
        LandingPageComponent,
        FileHandlerComponent,
        FilePreviewComponent
    ],
    templateUrl: './status-pendaftaran-ukom.component.html',
    styleUrl: './status-pendaftaran-ukom.component.scss'
})
export class StatusPendaftaranUkomComponent {
    pendingTask: UkomTaskDetail = new UkomTaskDetail()
    groupedUkomPendingTaskHistory: { [key: string]: any[] } = {}
    ukomDataLoading$ = new BehaviorSubject<boolean>(true)

    ukomStep$ = new BehaviorSubject<number>(1)
    currentUkomStep$ = new BehaviorSubject<number>(1)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

    finishTask: UkomTaskDetail = new UkomTaskDetail()
    CATSchore: CATSchore = new CATSchore()
    isCATModalOpen$ = new BehaviorSubject<boolean>(false)
    dataDokumenUkom: DataDokumenUkom[] = []

    fileHandlerData: FIleHandler = {
        files: {},
        viewOnly: true
    }
    predikatKinerjaList: any[] = []

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    key: string = undefined
    constructor(
        private converterService: ConverterService,
        private apiService: ApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(params => {
            const key = params['key']

            if (key) {
                this.key = key
            }
            this.loadPredikatKinerja()
        })
    }

    loadPredikatKinerja() {
        this.apiService.getData('/api/v1/predikat_kinerja').subscribe({
            next: res => {
                this.predikatKinerjaList = res;
                this.getPendingTask(this.key)
            },
            error: err => {
                console.error('Failed to fetch predikat kinerja:', err);
                this.getPendingTask(this.key)
            }
        });

    }

    getPendidikanList(pendidikanTerakhirCode: string) {
        this.apiService.getData(`/api/v1/pendidikan`).subscribe({
            next: response => {
                const matchedPendidikan = response.find(
                    (pendidikan: any) => pendidikan.code === pendidikanTerakhirCode
                );
                this.pendidikanName = matchedPendidikan ? matchedPendidikan.name : null;
            },
        });
    }


    mapDokumenUkom() {
        this.dataDokumenUkom.forEach((doc, index) => {
            this.fileHandlerData.files[`file${index}`] = {
                label: doc.dokumenPersyaratanName,
                source: doc.dokumenUrl,
                id: doc.id,
                required: false
            }
        })
    }

    toggleCATModal() {
        this.isCATModalOpen$.next(!this.isCATModalOpen$.value)
    }

    backToLandingPage() {
        this.router.navigate(['/'])
    }

    fetchPhotoProfile() {
        this.apiService.getPhotoProfile(LoginContext.getUserId()).subscribe({
            next: blob => {
                if (blob.size === 0) {
                    this.profileImageSrc = 'assets/no-profile.jpg'
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                this.profileImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl)
            },
            error: err => {
                console.error('Error fetching profile image', err)
                this.profileImageSrc = 'assets/no-profile.jpg'
            }
        })
    }

    getJenisUkomLabel(jenisUkom: string): string {
        return JenisUkomEnum[jenisUkom as keyof typeof JenisUkomEnum] || '-'
    }

    getProvinsiNameByCode(provinsiCode: string) {
        this.apiService.getData(`/api/v1/provinsi/${provinsiCode}`).subscribe({
            next: response => {
                this.provinsiName = response.name ?? null;
            },
        });
    }

    getKabupatenNameByCode(kabupatenCode: string) {
        this.apiService.getData(`/api/v1/kab_kota/${kabupatenCode}`).subscribe({
            next: response => {
                this.kabupatenName = response.name ?? null;
                this.typeKabKota = response.type ?? null;
            },
        });
    }

    getBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.apiService.getData(`/api/v1/bidang_jabatan/${bidangJabatanCode}`).subscribe({
            next: response => {
                this.bidangJabatanName = response.name ?? null;
            }
        })
    }

    getPredikatKinerja(code: string | null): string {
        console.log('code', code)
        if (!code || code == null) return '-';
        const predikat = this.predikatKinerjaList.find(predikat => predikat.id === code);
        return predikat ? predikat.name : '-';
    }

    getPendingTask(key: string) {
        this.ukomDataLoading$.next(true)
        this.apiService
            .getData(`/api/v1/participant_ukom_detail?key=${key}`)
            .subscribe({
                next: (response: any) => {
                    console.log('response')
                    this.getPendidikanList(response.data.pendidikanTerakhirCode)
                    if (response.data.provinsiId) {
                        this.getProvinsiNameByCode(response.data.provinsiId)
                    }

                    if (response.data.kabupatenKotaId) {
                        this.getKabupatenNameByCode(response.data.kabupatenKotaId)
                    }

                    if (response.data.bidangJabatanCode) {
                        this.getBidangjabatanNameByCode(response.data.bidangJabatanCode)
                    }

                    this.predikat1Name = this.getPredikatKinerja(response.data.predikatKinerja1Id);
                    this.predikat2Name = this.getPredikatKinerja(response.data.predikatKinerja2Id);

                    if (response.status == 'pending') {
                        this.pendingTask = response.data
                        console.log('Pending Task:', this.pendingTask)

                        switch (this.pendingTask.flowId) {
                            case 'ukom_flow_1':
                                this.ukomStep$.next(1)
                                this.currentUkomStep$.next(1)
                                break
                            case 'ukom_flow_2':
                                this.ukomStep$.next(2)
                                this.currentUkomStep$.next(2)
                                break
                            default:
                                break
                        }

                        if (this.pendingTask.pendingTaskHistory.length > 0) {
                            this.groupedUkomPendingTaskHistory =
                                this.groupAndSortTasksByFlowId(
                                    this.pendingTask.pendingTaskHistory
                                )
                        }
                    }

                    if (response.status == 'finish') {
                        this.finishTask = response.data
                        this.dataDokumenUkom = response.data.documentUkomList
                        this.mapDokumenUkom()
                    }

                    this.ukomDataLoading$.next(false)
                },
                error: error => {
                    this.ukomDataLoading$.next(false)
                }
            })
    }

    calculateAge(tanggalLahir: string | Date, tglSuratUsulan: string | Date): string {
        console.log('calculateAge', tanggalLahir, tglSuratUsulan);


        if (!tanggalLahir || !tglSuratUsulan) {
            return '-';
        }

        const birthDate = new Date(tanggalLahir);
        const suratDate = new Date(tglSuratUsulan);

        if (suratDate < birthDate) {
            return "Tanggal surat usulan tidak boleh sebelum tanggal lahir";
        }

        if (isNaN(birthDate.getTime()) || isNaN(suratDate.getTime())) {
            return '-'; // Return '-' jika format tanggal salah
        }

        let ageYears = suratDate.getFullYear() - birthDate.getFullYear();
        let ageMonths = suratDate.getMonth() - birthDate.getMonth();
        let ageDays = suratDate.getDate() - birthDate.getDate();

        // Jika bulan dalam tgl_surat_usulan kurang dari bulan lahir, atau bulan sama tapi tanggal lebih kecil
        if (ageMonths < 0 || (ageMonths === 0 && ageDays < 0)) {
            ageYears--;
            ageMonths += 12;
        }

        if (ageDays < 0) {
            const lastMonth = new Date(suratDate.getFullYear(), suratDate.getMonth(), 0);
            ageDays += lastMonth.getDate();
            ageMonths--;
        }

        return `${ageYears} Tahun ${ageMonths} Bulan ${ageDays} Hari`;
    }

    transformInstansiName(value: string): string {
        if (!value) return null;

        return value
            .toLowerCase() // Ubah ke lowercase semua dulu
            .replace(/_/g, ' ') // Ganti underscore dengan spasi
            .replace(/\b\w/g, char => char.toUpperCase()); // Kapitalisasi setiap kata
    }

    groupAndSortTasksByFlowId(tasks: any[]): { [key: string]: any[] } {
        const grouped = tasks.reduce((acc, task) => {
            if (!acc[task.flowId]) {
                acc[task.flowId] = []
            }
            acc[task.flowId].push(task)
            return acc
        }, {} as { [key: string]: any[] })

        Object.keys(grouped).forEach(flowId => {
            grouped[flowId].sort((a: any, b: any) => {
                const dateA = new Date(a.lastUpdated).getTime()
                const dateB = new Date(b.lastUpdated).getTime()
                return dateA - dateB
            })
        })

        return grouped
    }

    handleStepClick(clickedStep: number) {
        this.currentUkomStep$.subscribe(step => {
            if (clickedStep <= step) {
                console.log('clickedStep', clickedStep)
                this.ukomStep$.next(clickedStep)
            }
        })
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    convertDate(date: string) {
        return this.converterService.dateToHumanReadable(date)
    }
}
