import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { ExamDetail } from '../models/exam_detail'

@Injectable({
    providedIn: 'root',
})
export class UkomExamScheduleService {
    readonly API_BASE_URL = '/api/v1/exam_schedule'
    apiService = inject(ApiService)

    constructor() {}

    getExamDetailByRoomID(roomId: string): Observable<ExamDetail> {
        return this.apiService.getData(`${this.API_BASE_URL}/room/${roomId}`)
    }
}
