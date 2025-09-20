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

    private eligibleSubject = new BehaviorSubject<boolean>(false)
    isEligible$ = this.eligibleSubject.asObservable()

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
    checkEligibility(nip: string): void {
        this.eligibilityLoadingSubject.next(true)

        this.apiService
            .getData(`${this.BASE_PATH_TASK}/check_eligible/${nip}`)
            .pipe(
                map((res) => new Eligibility(res)),
                catchError((err) => {
                    console.error('Error checking eligibility', err)
                    this.handlerService.handleAlert('Error', err.message)
                    return of(new Eligibility({ eligible: false }))
                }),
                finalize(() => {
                    this.eligibilityLoadingSubject.next(false)
                }),
            )
            .subscribe((eligibility) => {
                this.eligibleSubject.next(eligibility.eligible)
            })
    }
}
