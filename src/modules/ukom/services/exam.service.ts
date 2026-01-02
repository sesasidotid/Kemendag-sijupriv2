import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { SaveExamAnswerRequest } from '@/modules/ukom/models/exam/exam-answer.model'
import { Observable } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class ExamService {
    readonly BASE_PATH = '/api/v1/exam'
    apiService = inject(ApiService)
    constructor() {}

    startExam(
        examTypeCode: string,
        roomUkomId: string,
        examScheduleId: string,
        secretKey: string | undefined,
    ) {
        return this.apiService.postData(`${this.BASE_PATH}/start`, {
            examTypeCode: examTypeCode,
            roomUkomId: roomUkomId,
            examScheduleId: examScheduleId,
            secret_key: secretKey,
        })
    }

    getExamQuestionsByScheduleAndParticipant(
        examScheduleId: string,
        participantId: string,
    ): Observable<any> {
        return this.apiService.getData(
            `${this.BASE_PATH}/page/examiner/${examScheduleId}/${participantId}`,
        )
    }

    saveExamAnswersByExamScheduleId(
        examScheduleId: string,
        payload: SaveExamAnswerRequest,
    ): Observable<any> {
        return this.apiService.postData(
            `${this.BASE_PATH}/answer/examiner/${examScheduleId}`,
            payload,
        )
    }
}
