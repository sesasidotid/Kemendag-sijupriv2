import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'
import { Observable } from 'rxjs'

export interface SearchExaminerParams {
    limit?: number
    page?: number
    searchName?: string
    userId?: string
}

@Injectable({
    providedIn: 'root',
})
export class UkomExaminerService {
    readonly BASE_PATH = '/api/v1/examiner_ukom'
    api = inject(ApiService)
    constructor() {}

    /**
     * @deprecated Use `searchExaminerV2({ ... })` instead.
     */
    searchExaminer(
        limit?: number,
        page?: number,
        searchName?: string,
        userId?: string,
    ): Observable<PaginationWrapper<ExaminerUkom>> {
        const params: Record<string, any> = {}

        if (limit !== undefined) params['limit'] = limit
        if (page !== undefined) params['page'] = page
        if (searchName) params['like_user|name'] = searchName
        if (userId) params['eq_userId'] = userId

        const queryString = new URLSearchParams(params).toString()

        const fullPath = queryString
            ? `${this.BASE_PATH}/search?${queryString}`
            : `${this.BASE_PATH}/search`

        return this.api.getData(fullPath)
    }

    searchExaminerV2(
        params: SearchExaminerParams = {},
    ): Observable<PaginationWrapper<ExaminerUkom>> {
        const queryParams: Record<string, any> = {}

        if (params.limit !== undefined) queryParams['limit'] = params.limit
        if (params.page !== undefined) queryParams['page'] = params.page
        if (params.searchName) queryParams['like_user|name'] = params.searchName
        if (params.userId) queryParams['eq_userId'] = params.userId

        const queryString = new URLSearchParams(queryParams).toString()

        const fullPath = queryString
            ? `${this.BASE_PATH}/search?${queryString}`
            : `${this.BASE_PATH}/search`

        return this.api.getData(fullPath)
    }
}
