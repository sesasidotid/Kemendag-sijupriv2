import { ApiService } from '@/modules/base/services/api.service'
import { ExamType } from '@/modules/ukom/models/exam-type.model'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class UkomMiscellaneousService {
    apiService = inject(ApiService)
    constructor() {}

    getExamType(): Observable<ExamType[]> {
        return this.apiService.getData('/api/v1/exam_type')
    }
}
