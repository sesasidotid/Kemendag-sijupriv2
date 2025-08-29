import { Injectable } from '@angular/core'
import { ApiService } from '../../base/services/api.service'
import { catchError, map, Observable } from 'rxjs'
import { UkomGrade } from '../models/ukom-grade'
@Injectable({
    providedIn: 'root'
})
export class UkomGradeService {
    readonly BASE_PATH = '/api/v1/ukom_grade/participant'
    constructor(
        private apiService: ApiService,
    ) { }

    findGradeParticipantJF(participant_id: string): Observable<UkomGrade> {
        return this.apiService.getData(`${this.BASE_PATH}/${participant_id}`).pipe(
            catchError(error => {
                console.log(error)
                throw error
            })
        )
    }

    findGradeParticipantNonJF(key: string): Observable<UkomGrade> {
        return this.apiService.getData(`${this.BASE_PATH}?key=${key}`).pipe(
            catchError(error => {
                console.log(error)
                throw error
            })
        )
    }

}