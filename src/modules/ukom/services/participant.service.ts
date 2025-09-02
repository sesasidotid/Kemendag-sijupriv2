import { Injectable } from '@angular/core'
import { ApiService } from '../../base/services/api.service'
import { catchError, map, Observable, throwError } from 'rxjs'
@Injectable({
    providedIn: 'root'
})

export class UkomParticipantService {
    readonly BASE_PATH = '/api/v1/participant_ukom'

    constructor(
        private apiService: ApiService,
    ) { }

    uploadRecomendationBatch(compressed_file: string): Observable<void> {
        return this.apiService.postData(
            `${this.BASE_PATH}/upload_rekomendasi/batch`,
            { compressed_file }
        ).pipe(
            map(() => void 0), // success = just void
            catchError(error => {
                console.error(error)
                return throwError(() => error) // propagate failure
            })
        )
    }

}