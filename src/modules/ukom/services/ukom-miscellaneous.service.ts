import { ApiService } from '@/modules/base/services/api.service'
import { ExamType } from '@/modules/ukom/models/exam-type.model'
import { inject, Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Injectable({
    providedIn: 'root',
})
export class UkomMiscellaneousService {
    apiService = inject(ApiService)
    constructor() {}

    getExamType(): Observable<ExamType[]> {
        return this.apiService.getData('/api/v1/exam_type').pipe(
            catchError((error) => {
                console.error('Failed to fetch exam types:', error)
                return of([])
            }),
        )
    }
}
