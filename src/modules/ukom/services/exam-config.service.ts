import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { ExamConfigRequest } from '@/modules/ukom/models/exam-config/exam-config-request.model'

@Injectable({
    providedIn: 'root',
})
export class ExamConfigService {
    readonly BASE_URL = '/api/v1/exam_config'
    api = inject(ApiService)
    constructor() {}

    shuffleCATQuestion(body: ExamConfigRequest) {
        return this.api.postData(`${this.BASE_URL}/shuffle`, body)
    }
}
