import { Observable } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { inject, Injectable } from '@angular/core'
import { ScoreValue } from '../models/cat/score-value.type'

@Injectable({
    providedIn: 'root',
})
export class ExamGradeService {
    readonly BASE_PATH = '/api/v1/exam_grade'
    apiService = inject(ApiService)
    constructor() {}

    // getExamGradeByCodeAndParticipantId(
    //     examCode: string,
    //     participantId: string,
    // ) {
    //     return this.apiService.getData(
    //         `${this.BASE_PATH}/${examCode}/${participantId}`,
    //     )
    // }

    getExamGradeByExamScheduleIdAndParticipantId(
        examScheduleId: string,
        participantId: string,
    ): Observable<ScoreValue> {
        return this.apiService.getData(
            `${this.BASE_PATH}/${examScheduleId}/${participantId}`,
        )
    }
}
