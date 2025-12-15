import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'
import { Observable } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class UkomExaminerService {
    readonly BASE_PATH = '/api/v1/examiner_ukom'
    api = inject(ApiService)
    constructor() {}
    searchExaminer(
        limit?: number,
        page?: number,
        searchName?: string,
    ): Observable<PaginationWrapper<ExaminerUkom>> {
        const params: Record<string, any> = {}

        if (limit !== undefined) params['limit'] = limit
        if (page !== undefined) params['page'] = page
        if (searchName) params['like_user|name'] = searchName

        const queryString = new URLSearchParams(params).toString()

        const fullPath = queryString
            ? `${this.BASE_PATH}/search?${queryString}`
            : `${this.BASE_PATH}/search`

        return this.api.getData(fullPath)
    }
}
