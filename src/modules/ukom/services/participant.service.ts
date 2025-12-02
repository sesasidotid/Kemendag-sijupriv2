import { Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    throwError,
    finalize,
} from 'rxjs'
import { NonJFParticipantUkomTask } from '@/modules/ukom/models/ukom-registration-refactored/non-jf-participant-ukom-task.model'
import { Task } from '@/modules/workflow/models/task.model'
import { HandlerService } from '@/modules/base/services/handler.service'
import { Participant } from '../models/cat/participant.model'
@Injectable({
    providedIn: 'root',
})
export class UkomParticipantService {
    readonly BASE_PATH = '/api/v1/participant_ukom'

    private canJFRegisterUkomSubject = new BehaviorSubject<boolean>(false)
    isJFCanRegisterUkom$ = this.canJFRegisterUkomSubject.asObservable()

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    uploadRecomendationBatch(compressed_file: string): Observable<void> {
        return this.apiService
            .postData(`${this.BASE_PATH}/upload_rekomendasi/batch`, {
                compressed_file,
            })
            .pipe(
                map((): void => void 0),
                catchError((error) => {
                    console.error(error)
                    return throwError(() => error) // propagate failure
                }),
            )
    }

    registerUkomParticipantNonJF(
        payload: NonJFParticipantUkomTask,
    ): Observable<{ key: string; imageUrl: string }> {
        return this.apiService.postData(`${this.BASE_PATH}/task`, payload).pipe(
            map((response) => response),
            catchError((error) => {
                console.error(error)
                return throwError(() => error)
            }),
        )
    }

    isJFCanRegisterUkom(nip: string) {
        this.apiService
            .getData(`${this.BASE_PATH}/latest/${nip}`)
            .pipe(
                map((response) => {
                    return !response.id
                }),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    if (error.error.code === 'RCD-00001') {
                        return of(true) // eligible
                    }
                    return of(false) // not eligible
                }),
            )
            .subscribe((canRegister) => {
                this.canJFRegisterUkomSubject.next(canRegister)
            })
    }

    isSubmitTaskLoadingSubject = new BehaviorSubject<boolean>(false)
    isSubmitTaskLoading$ = this.isSubmitTaskLoadingSubject.asObservable()
    submitUkomTask(body: Task, onSuccess?: () => void) {
        this.isSubmitTaskLoadingSubject.next(true)

        this.apiService
            .postData(`${this.BASE_PATH}/task/submit`, body)
            .pipe(
                catchError((error) => {
                    console.error('Error submitting task', error)
                    this.handlerService.handleException(error)
                    return throwError(() => error)
                }),
                finalize(() => this.isSubmitTaskLoadingSubject.next(false)),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil mengirim tugas',
                    )
                    onSuccess?.()
                },
            })
    }

    isSubmitUkomTaskNonJFLoadingSubject = new BehaviorSubject<boolean>(false)
    isSubmitUkomTaskNonJFLoading$ =
        this.isSubmitUkomTaskNonJFLoadingSubject.asObservable()
    submitUkomTaskNonJF(body: Task, key: string, onSuccess?: () => void) {
        this.isSubmitUkomTaskNonJFLoadingSubject.next(true)

        this.apiService
            .postData(`${this.BASE_PATH}/task/non_jf/submit?key=${key}`, body)
            .pipe(
                catchError((error) => {
                    console.error('Error submitting task', error)
                    this.handlerService.handleException(error)
                    return throwError(() => error)
                }),
                finalize(() =>
                    this.isSubmitUkomTaskNonJFLoadingSubject.next(false),
                ),
            )
            .subscribe(() => {
                this.handlerService.handleAlert(
                    'Success',
                    'Berhasil mengirim tugas',
                )
                onSuccess?.()
            })
    }

    getParticipantUkom(nip: string): Observable<Participant> {
        return this.apiService.getData(`/api/v1/participant_ukom/nip/${nip}`)
    }
}
