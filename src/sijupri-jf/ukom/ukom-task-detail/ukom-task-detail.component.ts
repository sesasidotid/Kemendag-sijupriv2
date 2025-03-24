import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { Component } from '@angular/core'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { Pangkat } from '../../../modules/maintenance/models/pangkat.model'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { CATSchore } from '../../../modules/ukom/models/cat/cat-schore'
import { Router } from '@angular/router'
import { DataDokumenUkom } from '../../../modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [CommonModule, ModalComponent, FileHandlerComponent],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
    id: string

    jenjang: Jenjang = new Jenjang()
    pangkat: Pangkat = new Pangkat()
    CATSchore: CATSchore = new CATSchore()

    ukomDetail = new UkomTaskDetail()
    ukomDetailLoading$ = new BehaviorSubject<boolean>(false)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    dataDokumenUkom: DataDokumenUkom[] = []

    fileHandlerData: FIleHandler = {
        files: {},
        viewOnly: true
    }

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string
    unitKerjaName: string | null = null;

    predikatKinerjaList: any[] = []

    constructor(
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadPredikatKinerja()

        this.activatedRoute.paramMap.subscribe(params => {
            this.id = params.get('id')
            this.getParticipantUkomDetail()
            this.getDokumenUkomList()
        })
    }

    loadPredikatKinerja() {
        this.apiService.getData('/api/v1/predikat_kinerja').subscribe({
            next: res => {
                this.predikatKinerjaList = res;
            },
            error: err => {
                console.error('Failed to fetch predikat kinerja:', err);
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

    getBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.apiService.getData(`/api/v1/bidang_jabatan/${bidangJabatanCode}`).subscribe({
            next: response => {
                this.bidangJabatanName = response.name ?? null;
            }
        })
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

    calculateAge(tanggalLahir: string | Date, tglSuratUsulan: string | Date): string {
        console.log('calculateAge', tanggalLahir, tglSuratUsulan);

        if (!tanggalLahir || !tglSuratUsulan) {
            return '-';
        }

        const birthDate = new Date(tanggalLahir);
        const suratDate = new Date(tglSuratUsulan);

        console.log(typeof birthDate, typeof suratDate);

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

    getPredikatKinerja(code: string | null): string {
        console.log('code', code)
        if (!code || code == null) return '-';
        const predikat = this.predikatKinerjaList.find(predikat => predikat.id === code);
        return predikat ? predikat.name : '-';
    }

    transformInstansiName(value: string): string {
        if (!value) return null;

        return value
            .toLowerCase() // Ubah ke lowercase semua dulu
            .replace(/_/g, ' ') // Ganti underscore dengan spasi
            .replace(/\b\w/g, char => char.toUpperCase()); // Kapitalisasi setiap kata
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

    getDokumenUkomList() {
        this.apiService
            .getData(`/api/v1/document_ukom/participant/${this.id}`)
            .subscribe({
                next: (response: DataDokumenUkom[]) => {
                    this.dataDokumenUkom = response
                    this.mapDokumenUkom()
                },
                error: error => {
                    console.log(error)
                }
            })
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    getCATScore() {
        const exam_type_code = 'CAT'

        this.apiService
            .getData(`/api/v1/exam_grade/${exam_type_code}/${this.id}`)
            .subscribe({
                next: (response: any) => {
                    this.CATSchore = new CATSchore(response)
                }
            })
    }
    backToList() {
        this.router.navigate(['/ukom/ukom-list'])
    }

    getCorrectAnswer(question: any): string {
        const correctChoice = question.multipleChoiceDtoList.find(
            (choice: any) => choice.correct
        )
        return correctChoice ? correctChoice.choiceId : ''
    }

    getUnitKerjaById(unit_kerja_id: string) {
        this.apiService.getData(`/api/v1/unit_kerja/${unit_kerja_id}`).subscribe({
            next: (response: any) => {
                this.unitKerjaName = response.name
            }
        })
    }

    getParticipantUkomDetail() {
        this.ukomDetailLoading$.next(true)
        this.apiService.getData(`/api/v1/participant_ukom/${this.id}`).subscribe({
            next: response => {
                this.ukomDetail = response
                if (!response.unitKerjaName) {
                    this.getUnitKerjaById(response.unitKerjaId)
                }

                this.getPendidikanList(this.ukomDetail.pendidikanTerakhirCode)

                if (this.ukomDetail.provinsiId) {
                    this.getProvinsiNameByCode(this.ukomDetail.provinsiId)
                }

                if (this.ukomDetail.kabupatenKotaId) {
                    this.getKabupatenNameByCode(this.ukomDetail.kabupatenKotaId)
                }

                if (this.ukomDetail.bidangJabatanCode) {
                    this.getBidangjabatanNameByCode(this.ukomDetail.bidangJabatanCode)
                }

                this.predikat1Name = this.getPredikatKinerja(this.ukomDetail.predikatKinerja1Id);
                this.predikat2Name = this.getPredikatKinerja(this.ukomDetail.predikatKinerja2Id);
                console.log(this.ukomDetail)
                this.getCATScore()

                this.ukomDetailLoading$.next(false)
            },
            error: error => {
                this.ukomDetailLoading$.next(false)
                console.log(error)
            }
        })
    }
}
