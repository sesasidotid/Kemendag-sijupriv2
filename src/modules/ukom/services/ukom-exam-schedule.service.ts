import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { UpdateExamScheduleRequest } from '../models/exam-schedule/update-exam-schedule-request.model'
import { ExamSchedule } from '../models/exam-schedule/exam-schedule.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { BaseExamScheduleRequest } from '../models/exam-schedule/create-exam-schedule-request.model'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { UpdateExaminerForParticipantRequest } from '@/modules/ukom/models/exam-schedule/update-examiner-for-participant-request.model'

@Injectable({
    providedIn: 'root',
})
export class UkomExamScheduleService {
    readonly API_BASE_URL = '/api/v1/exam_schedule'
    apiService = inject(ApiService)

    constructor() {}

    getExamSchedulesRoomID(roomId: string): Observable<ExamSchedule[]> {
        return this.apiService.getData(`${this.API_BASE_URL}/room/${roomId}`)
    }

    createExamSchedule(
        examTypeCode: ExamTypeCategory,
        body: BaseExamScheduleRequest,
    ): Observable<void> {
        const type = examTypeCode.toLowerCase()
        return this.apiService.postData(`${this.API_BASE_URL}/${type}`, body)
    }

    updateExamSchedule(body: UpdateExamScheduleRequest): Observable<void> {
        return this.apiService.putData(`${this.API_BASE_URL}/`, body)
    }

    deleteExamScheduleById(examScheduleId: string): Observable<void> {
        return this.apiService.deleteData(
            `${this.API_BASE_URL}/${examScheduleId}`,
        )
    }

    getExamScheduleDetailById(id: string): Observable<ExamSchedule> {
        return this.apiService.getData(`${this.API_BASE_URL}/detail/${id}`)
    }

    updateParticipantScheduleById(
        id: string,
        personalSchedule: string | Date,
    ): Observable<void> {
        return this.apiService.putData(
            `${this.API_BASE_URL}/participant_schedule/${id}`,
            { personalSchedule },
        )
    }

    getExamByExaminerId(examinerId: string): Observable<ExamSchedule[]> {
        return this.apiService.getData(
            `${this.API_BASE_URL}/examiner/${examinerId}`,
        )
    }

    getExaminerListByExamScheduleId(
        examScheduleId: string,
    ): Observable<ExaminerScheduleList[]> {
        return this.apiService.getData(
            `${this.API_BASE_URL}/examiner_schedule/${examScheduleId}`,
        )
    }

    getParticipantListByExamScheduleId(
        examScheduleId: string,
    ): Observable<ParticipantScheduleList[]> {
        return this.apiService.getData(
            `${this.API_BASE_URL}/participant_schedule/${examScheduleId}`,
        )
    }

    updateExaminerForParticipantScheduleByParticipantScheduleId(
        payload: UpdateExaminerForParticipantRequest,
    ) {
        return this.apiService.putData(
            `${this.API_BASE_URL}/examiner_schedule`,
            payload,
        )
    }
}
