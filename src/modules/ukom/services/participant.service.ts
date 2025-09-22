import { Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    throwError,
} from 'rxjs'
import { NonJFParticipantUkomTask } from '@/modules/ukom/models/ukom-registration-refactored/non-jf-participant-ukom-task.model'
@Injectable({
    providedIn: 'root',
})
export class UkomParticipantService {
    readonly BASE_PATH = '/api/v1/participant_ukom'

    private canJFRegisterUkomSubject = new BehaviorSubject<boolean>(false)
    isJFCanRegisterUkom$ = this.canJFRegisterUkomSubject.asObservable()

    constructor(private apiService: ApiService) {}

    uploadRecomendationBatch(compressed_file: string): Observable<void> {
        return this.apiService
            .postData(`${this.BASE_PATH}/upload_rekomendasi/batch`, {
                compressed_file,
            })
            .pipe(
                map((): void => void 0), // success = just void
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
                    // if there’s an id, registration NOT allowed
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
}
