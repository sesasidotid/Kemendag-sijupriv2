import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { SaveExamAnswerRequest } from '@/modules/ukom/models/exam/exam-answer.model'
import { Observable } from 'rxjs'
import { HttpParams } from '@angular/common/http'
import { ExaminerExamStartRequest } from '@/modules/ukom/models/exam/start-exam-request.model'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'

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
        secretKey?: string | undefined,
    ) {
        return this.apiService.postData(`${this.BASE_PATH}/start`, {
            examTypeCode: examTypeCode,
            roomUkomId: roomUkomId,
            examScheduleId: examScheduleId,
            secret_key: secretKey,
        })
    }

    startExamByExaminer(payload: ExaminerExamStartRequest) {
        return this.apiService.postData(
            `${this.BASE_PATH}/examiner/start`,
            payload,
        )
    }

    getExamQuestionsByScheduleAndParticipant(
        examScheduleId: string,
        participantId: string,
        queryParams?: Record<string, string>,
    ): Observable<PaginationWrapper<ExamQuestion>> {
        let params = new HttpParams()

        if (queryParams) {
            Object.entries(queryParams).forEach(([key, value]) => {
                params = params.set(key, value)
            })
        }

        const path =
            `${this.BASE_PATH}/page/examiner/${examScheduleId}/${participantId}` +
            (params.toString() ? `?${params.toString()}` : '')

        return this.apiService.getData(path)
    }

    saveExamAnswersByExamScheduleId(
        examScheduleId: string,
        payload: SaveExamAnswerRequest,
    ): Observable<unknown> {
        return this.apiService.postData(
            `${this.BASE_PATH}/answer/examiner/${examScheduleId}`,
            payload,
        )
    }

    getExamQuestionByScheduleId(
        examScheduleId: string,
        queryParams?: Record<string, string>,
    ): Observable<PaginationWrapper<ExamQuestion>> {
        let params = new HttpParams()

        if (queryParams) {
            Object.entries(queryParams).forEach(([key, value]) => {
                params = params.set(key, value)
            })
        }

        const path =
            `${this.BASE_PATH}/page/${examScheduleId}` +
            (params.toString() ? `?${params.toString()}` : '')

        return this.apiService.getData(path)
    }
}
