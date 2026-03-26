import { Injectable } from '@angular/core'
import { ApiService } from '../../base/services/api.service'
import { catchError, Observable } from 'rxjs'
import { UkomGrade } from '../models/ukom-grade'

@Injectable({
    providedIn: 'root',
})
export class UkomGradeService {
    readonly BASE_PATH = '/api/v1/ukom_grade'
    constructor(private apiService: ApiService) {}

    findGradeParticipantJF(participant_id: string): Observable<UkomGrade> {
        return this.apiService
            .getData(`${this.BASE_PATH}/participant/${participant_id}`)
            .pipe(
                catchError((error) => {
                    console.log(error)
                    throw error
                }),
            )
    }

    findGradeParticipantNonJF(key: string): Observable<UkomGrade> {
        return this.apiService
            .getData(`${this.BASE_PATH}/participant?key=${key}`)
            .pipe(
                catchError((error) => {
                    console.log(error)
                    throw error
                }),
            )
    }

    sendGradeToParticipantsByAdmin() {
        return this.apiService.postData(`${this.BASE_PATH}/publish_all`, {})
    }
}
