import { Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { catchError, map, Observable, throwError } from 'rxjs'
import { NonJFParticipantUkomTask } from '@/modules/ukom/models/ukom-registration-refactored/non-jf-participant-ukom-task.model'
@Injectable({
    providedIn: 'root',
})
export class UkomParticipantService {
    readonly BASE_PATH = '/api/v1/participant_ukom'

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
}
