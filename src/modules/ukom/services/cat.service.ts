import { ApiService } from '@/modules/base/services/api.service'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ExamAttendance } from '../models/cat/exam-attendance'

@Injectable({
    providedIn: 'root',
})
export class CatService {
    private serverTimezoneOffset = '+07:00'

    apiService = inject(ApiService)

    getExamAttendance(
        examType: string,
        roomId: string,
        participantId: string,
    ): Observable<ExamAttendance> {
        return this.apiService.getData(
            `/api/v1/exam_attendance/${examType}/${roomId}/${participantId}`,
        )
    }

    parseServerDate(dateStr: string): Date {
        const formatted = `${dateStr.replace(' ', 'T')}${
            this.serverTimezoneOffset
        }`
        return new Date(formatted)
    }
}
