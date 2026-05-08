import { ApiService } from '@/modules/base/services/api.service'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ExamAttendance } from '../models/cat/exam-attendance'

@Injectable({
    providedIn: 'root',
})
export class CatService {
    apiService = inject(ApiService)
    private serverTimezoneOffset = '+07:00'

    getExamAttendance(
        examScheduleId: string,
        participantId: string,
    ): Observable<ExamAttendance> {
        return this.apiService.getData(
            `/api/v1/exam_attendance/${examScheduleId}/${participantId}`,
        )
    }

    deleteExamAttendance(examScheduleId: string): Observable<void> {
        return this.apiService.deleteData(
            `/api/v1/exam_attendance/exam_schedule/${examScheduleId}`,
        )
    }

    parseServerDate(dateStr: string): Date {
        const formatted = `${dateStr.replace(' ', 'T')}${
            this.serverTimezoneOffset
        }`
        return new Date(formatted)
    }
}
