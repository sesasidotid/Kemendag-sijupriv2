import { Injectable } from '@angular/core'
import { ApiService } from '../../base/services/api.service'
import { HandlerService } from '../../base/services/handler.service'
import {
    BehaviorSubject,
    catchError,
    finalize,
    map,
    Observable,
    of,
} from 'rxjs'
import { UkomTaskDetail } from '../models/ukom-task-detail.modal'
import { Task } from '../../workflow/models/task.model'
import { Eligibility } from '@/modules/ukom/models/ukom-registration-refactored/eligibility.model'
@Injectable({
    providedIn: 'root',
})
export class UkomTaskService {
    readonly BASE_PATH_TASK = '/api/v1/participant_ukom/task'

    private eligibilityLoadingSubject = new BehaviorSubject<boolean>(false)
    isEligibilityLoading$ = this.eligibilityLoadingSubject.asObservable()

    private eligibleSubject = new BehaviorSubject<Eligibility>(
        new Eligibility(),
    )
    eligibility$ = this.eligibleSubject.asObservable()

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    findByNip(nip: string): Observable<UkomTaskDetail> {
        return this.apiService
            .getData(`${this.BASE_PATH_TASK}/nip/${nip}`)
            .pipe(
                catchError((error) => {
                    console.error('Error fetching data', error)
                    throw error
                }),
            )
    }

    approveFailedTask(id: string): Observable<void> {
        return this.apiService
            .postData(`${this.BASE_PATH_TASK}/failed_to_completed`, { id: id })
            .pipe(
                map(() => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil menyetujui pengajuan',
                    )
                }),
                catchError((error) => {
                    console.error('Error approving task', error)
                    this.handlerService.handleException(error)
                    throw error
                }),
            )
    }

    submitTask(body: Task): Observable<void> {
        return this.apiService
            .postData(`${this.BASE_PATH_TASK}/submit`, body)
            .pipe(
                map(() => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil mengirimkan tugas',
                    )
                }),
                catchError((error) => {
                    console.error('Error submitting task', error)
                    this.handlerService.handleException(error)
                    throw error
                }),
            )
    }

    finishPendingTask(): Observable<void> {
        return this.apiService
            .postData(`${this.BASE_PATH_TASK}/submit/all`, {})
            .pipe(
                map(() => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil memfinalisasi tugas tertunda.',
                    )
                }),
                catchError((error) => {
                    console.error('Error finishing pending task', error)
                    this.handlerService.handleException(error)
                    throw error
                }),
            )
    }

    private mapEligibilityMessage(code: string, message: string): string {
        switch (code) {
            case 'UEL-00000':
                return 'Profil belum lengkap (email dan nomor telepon).'
            case 'UEL-00001':
                return 'Riwayat jabatan tidak ditemukan.'
            case 'UEL-00002':
                return 'Riwayat pangkat tidak ditemukan.'
            case 'UEL-00003':
                return 'Riwayat pendidikan tidak ditemukan.'
            case 'UEL-00004':
                return 'Riwayat kinerja tidak ditemukan.'
            case 'UEL-00005':
                return 'Angka kredit di bawah ambang batas.'
            case 'UEL-00006':
                return 'Rating hasil tidak memenuhi syarat.'
            case 'UEL-00007':
                return 'Rating kinerja tidak memenuhi syarat.'
            case 'UEL-00008':
                return 'Predikat kinerja tidak memenuhi syarat.'
            case 'UEL-00009':
                return 'Pendaftaran sudah ada.'
            default:
                return message
        }
    }

    checkEligibility(jenisUkom: string, nip: string): void {
        this.eligibilityLoadingSubject.next(true)

        this.apiService
            .getData(
                `${this.BASE_PATH_TASK}/check_eligible/${jenisUkom}/${nip}`,
            )
            .pipe(
                map((res) => {
                    const eligibility = new Eligibility(res)
                    return new Eligibility({
                        ...eligibility,
                        message: this.mapEligibilityMessage(
                            eligibility.code,
                            eligibility.message,
                        ),
                    })
                }),
                catchError((err) => {
                    console.error('Error checking eligibility', err)
                    this.handlerService.handleException(err)
                    return of(
                        new Eligibility({
                            eligible: false,
                            message: 'Terjadi kesalahan pada sistem.',
                        }),
                    )
                }),
                finalize(() => {
                    this.eligibilityLoadingSubject.next(false)
                }),
            )
            .subscribe((eligibility) => {
                this.eligibleSubject.next(eligibility)
            })
    }
}
