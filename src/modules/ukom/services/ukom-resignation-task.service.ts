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
import { UkomResignationPendingTask } from '../models/ukom-registration-refactored/resignation-pending-task.model'

@Injectable({
    providedIn: 'root',
})
export class UkomResignationTaskService {
    readonly BASE_PATH_TASK = '/api/v1/ukom_resignation/task'

    private pendingTaskDetailSubject =
        new BehaviorSubject<UkomResignationPendingTask>(null)
    pendingTaskDetail$ = this.pendingTaskDetailSubject.asObservable()
    private pendingTaskDetailLoadingSubject = new BehaviorSubject<boolean>(
        false,
    )
    isPendingTaskDetailLoading$ =
        this.pendingTaskDetailLoadingSubject.asObservable()

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    findByNip(nip: string): Observable<UkomTaskDetail> {
        return this.apiService
            .getData(`${this.BASE_PATH_TASK}/nip/${nip}`)
            .pipe(
                catchError((error) => {
                    throw error
                }),
            )
    }

    findById(id: string) {
        this.pendingTaskDetailLoadingSubject.next(true)

        this.apiService
            .getData(`${this.BASE_PATH_TASK}/${id}`)
            .pipe(
                map((data) => new UkomResignationPendingTask(data)),
                catchError((error) => {
                    this.handlerService.handleException(error)
                    return of(new UkomResignationPendingTask())
                }),
                finalize(() =>
                    this.pendingTaskDetailLoadingSubject.next(false),
                ),
            )
            .subscribe((pendingTask) => {
                this.pendingTaskDetailSubject.next(pendingTask)
            })
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
                    this.handlerService.handleException(error)
                    throw error
                }),
            )
    }
}
