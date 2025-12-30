import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { CreateExamScheduleRequest } from '../models/exam-schedule/create-exam-schedule-request.model'
import { UpdateExamScheduleRequest } from '../models/exam-schedule/update-exam-schedule-request.model'
import { ExamSchedule } from '../models/exam-schedule/exam-schedule.model'

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

    createExamSchedule(body: CreateExamScheduleRequest): Observable<void> {
        return this.apiService.postData(this.API_BASE_URL, body)
    }

    updateExamSchedule(body: UpdateExamScheduleRequest): Observable<void> {
        return this.apiService.putData(this.API_BASE_URL, body)
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
    ): Observable<any> {
        return this.apiService.putData(
            `${this.API_BASE_URL}/participant_schedule/${id}`,
            { personalSchedule },
        )
    }
}
