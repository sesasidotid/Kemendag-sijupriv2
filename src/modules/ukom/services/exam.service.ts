import { Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { inject } from '@angular/core'

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
}
