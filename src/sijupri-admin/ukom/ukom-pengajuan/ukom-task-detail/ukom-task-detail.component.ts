import { Component } from '@angular/core'
import { PesertaUkom } from '../../../../modules/ukom/models/peserta-ukom.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model'
import { ActivatedRoute } from '@angular/router'
import { Task } from '../../../../modules/workflow/models/task.model'
import { CommonModule } from '@angular/common'
import { FilePreviewService } from '../../../../modules/base/services/file-preview.service'
import { PrevPendingTask } from '../../../../modules/workflow/models/prev-pending-task'
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs'
import { FormsModule } from '@angular/forms';
import { JF } from '../../../../modules/siap/models/jf.model'

@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
    pesertaUkom: PesertaUkom
    pendingTask: PendingTask
    isApproveEnable: boolean = true
    id: string
    body: any
    prevPendingTask: PrevPendingTask
    prevApprovedTask: any[] = []
    hadItemsLoading$ = new BehaviorSubject<boolean>(false)

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    predikatKinerjaList: any[] = []

    JFDetail: JF = new JF()

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private filePreviewService: FilePreviewService
    ) { }

    ngOnInit() {
        this.loadPredikatKinerja()
        this.activatedRoute.params.subscribe(params => {
            this.id = params['id']
        })
        this.getPendingTask()
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


    getJFDetail(nip: string) {
        this.apiService.getData(`/api/v1/jf/${nip}`).subscribe({
            next: response => {
                this.JFDetail = new JF(response)
            }
        })
    }

    getPendingTask() {
        this.apiService.getData(`/api/v1/pending_task/${this.id}`).subscribe({
            next: response => {
                this.pendingTask = new PendingTask(response)
                this.pesertaUkom = new PesertaUkom(this.pendingTask.objectTask.object)
                this.prevPendingTask = new PrevPendingTask(
                    this.pendingTask.objectTask.prevObject
                )


                this.getPendidikanList(this.pendingTask.objectTask.object.pendidikanTerakhirCode)
                if (this.pendingTask.objectTask.object.provinsiId) {
                    this.getProvinsiNameByCode(this.pendingTask.objectTask.object.provinsiId)
                }

                if (this.pendingTask.objectTask.object.kabupatenKotaId) {
                    this.getKabupatenNameByCode(this.pendingTask.objectTask.object.kabupatenKotaId)
                }

                if (this.pendingTask.objectTask.object.bidangJabatanCode) {
                    this.getBidangjabatanNameByCode(this.pendingTask.objectTask.object.bidangJabatanCode)
                }

                this.predikat1Name = this.getPredikatKinerja(this.pendingTask.objectTask.object.predikatKinerja1Id);
                this.predikat2Name = this.getPredikatKinerja(this.pendingTask.objectTask.object.predikatKinerja2Id);

                this.findApproveDokumen(this.prevPendingTask.dokumenUkomList)
            },
            error: error => this.handlerService.handleException(error)
        })
    }

    findApproveDokumen(dokumenUkomList: any[]) {
        this.prevApprovedTask = dokumenUkomList.filter(
            dokumen => dokumen.dokumenStatus === 'APPROVE'
        )
        console.log('prevApprovedTask', this.prevApprovedTask)
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }

    isDocumentApproved(dokumenPersyaratanId: string): boolean {
        return this.prevApprovedTask.some(
            approvedDokumen =>
                approvedDokumen.dokumenPersyaratanId === dokumenPersyaratanId
        )
    }

    onFIleSwitch(index: number, status: 'APPROVE' | 'REJECT') {
        this.pesertaUkom.dokumenUkomList[index].status = status

        if (status == 'APPROVE') {
            this.pesertaUkom.dokumenUkomList[index].remark = '';
        }

        for (const formasiDokumen of this.pesertaUkom.dokumenUkomList) {
            if (formasiDokumen.status == 'REJECT') {
                this.isApproveEnable = false
                break
            }
            this.isApproveEnable = true
        }
    }

    back() {
        history.back()
    }

    sendSubmission() {
        console.log('body', this.body);


        this.apiService.postData(`/api/v1/participant_ukom/task/submit`, this.body)
            .subscribe({
                next: () => {
                    this.hadItemsLoading$.next(false);
                    this.handlerService.handleAlert('Success', 'Berhasil mengirimkan tugas');
                    this.handlerService.handleNavigate('/ukom/ukom-task-list');
                },
                error: error => {
                    this.hadItemsLoading$.next(false);
                    console.error(error);
                    this.handlerService.handleAlert('Error', 'Gagal mengirimkan tugas');
                }
            })
    }

    submitApprove() {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return;
                this.hadItemsLoading$.next(true);

                const task = new Task();
                task.id = this.pendingTask.id;
                task.remark = result.comment || null;
                task.taskAction = 'approve';

                this.body = {
                    id: this.pendingTask.id,
                    taskAction: task.taskAction
                };

                this.sendSubmission();
            }
        });
    }

    submitAmend() {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return;
                this.hadItemsLoading$.next(true);

                const task = new Task();
                task.id = this.pendingTask.id;
                task.taskAction = 'amend';

                this.body = {
                    id: this.pendingTask.id,
                    taskAction: task.taskAction,
                };

                const rejectedDokumenUkomList = this.pesertaUkom.dokumenUkomList.filter(
                    dokumen => dokumen.status === 'REJECT'
                );

                if (rejectedDokumenUkomList.length > 0) {
                    this.body.object = { dokumenUkomList: rejectedDokumenUkomList };
                }

                this.sendSubmission();
            }
        });
    }

    submitReject() {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return;
                this.hadItemsLoading$.next(true);

                const task = new Task();
                task.id = this.pendingTask.id;
                task.taskAction = 'reject';

                this.body = {
                    id: this.pendingTask.id,
                    taskAction: task.taskAction,
                };

                const rejectedDokumenUkomList = this.pesertaUkom.dokumenUkomList.filter(
                    dokumen => dokumen.status === 'REJECT'
                );

                if (rejectedDokumenUkomList.length > 0) {
                    this.body.object = { dokumenUkomList: rejectedDokumenUkomList };
                }

                this.sendSubmission();
            }
        });
    }
}
