import { PaginationWrapper } from './../../base/models/pagination.model'
import { Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import {
    BehaviorSubject,
    catchError,
    finalize,
    map,
    Observable,
    of,
    throwError,
} from 'rxjs'
import { NonJFParticipantUkomTask } from '@/modules/ukom/models/ukom-registration-refactored/non-jf-participant-ukom-task.model'
import { Task } from '@/modules/workflow/models/task.model'
import { HandlerService } from '@/modules/base/services/handler.service'
import { Participant } from '../models/cat/participant.model'
import { ParticipantHistoryTask } from '../models/ukom-module-refactor/participant-history-task.model'
import { RoomParticipant } from '../models/room/room-participant.model'

@Injectable({
    providedIn: 'root',
})
export class UkomParticipantService {
    readonly BASE_PATH = '/api/v1/participant_ukom'
    isSubmitTaskLoadingSubject = new BehaviorSubject<boolean>(false)
    isSubmitTaskLoading$ = this.isSubmitTaskLoadingSubject.asObservable()
    isSubmitUkomTaskNonJFLoadingSubject = new BehaviorSubject<boolean>(false)
    isSubmitUkomTaskNonJFLoading$ =
        this.isSubmitUkomTaskNonJFLoadingSubject.asObservable()
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
        return this.apiService.getData(`${this.BASE_PATH}/nip/${nip}`)
    }

    getParticipantByParticipantId(
        participantId: string,
    ): Observable<Participant> {
        return this.apiService.getData(`${this.BASE_PATH}/${participantId}`)
    }
    deleteTaskById(id: string): Observable<void> {
        return this.apiService.deleteData(`${this.BASE_PATH}/${id}`)
    }

    searchTask(
        limit?: number,
        page?: number,
        extraParams?: Record<string, any>,
    ): Observable<PaginationWrapper<ParticipantHistoryTask>> {
        const params: Record<string, any> = {}

        if (limit !== undefined) params['limit'] = limit
        if (page !== undefined) params['page'] = page

        // Merge caller-supplied extra params
        if (extraParams) {
            Object.assign(params, extraParams)
        }

        // Convert params object to query string
        const queryString = Object.keys(params)
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
            )
            .join('&')

        const fullPath = queryString
            ? `${this.BASE_PATH}/search?${queryString}`
            : `${this.BASE_PATH}/search`

        return this.apiService.getData(fullPath)
    }

    getParticipantListByRoomUkomId(
        roomUkomId: string,
    ): Observable<RoomParticipant[]> {
        return this.apiService.getData(`${this.BASE_PATH}/room/${roomUkomId}`)
    }
}
