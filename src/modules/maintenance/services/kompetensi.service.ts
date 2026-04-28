import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import {
    KompetensiUkom,
    KompetensiUkomSearchQueryParams,
} from '@/modules/ukom/models/kompetensi'
import { catchError, Observable } from 'rxjs'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { HttpParams } from '@angular/common/http'

@Injectable({
    providedIn: 'root',
})
export class KompetensiService {
    readonly BASE_PATH = '/api/v1/kompetensi'

    apiService = inject(ApiService)

    constructor() {}

    searchAll(
        queryParams: KompetensiUkomSearchQueryParams,
    ): Observable<PaginationWrapper<KompetensiUkom>> {
        let params = new HttpParams()

        if (queryParams) {
            Object.keys(queryParams).forEach((key) => {
                const value = (queryParams as any)[key]
                if (value !== undefined && value !== null && value !== '') {
                    params = params.set(key, value)
                }
            })
        }

        const queryString = params.toString()
        const url = queryString
            ? `${this.BASE_PATH}/search?${queryString}`
            : `${this.BASE_PATH}/search`

        return this.apiService.getData(url).pipe(
            catchError((error) => {
                console.error('Error fetching data', error)
                throw error
            }),
        )
    }

    findById(kompetensiId: string): Observable<KompetensiUkom> {
        return this.apiService
            .getData(`${this.BASE_PATH}/${kompetensiId}`)
            .pipe(
                catchError((error) => {
                    console.error('Error fetching data', error)
                    throw error
                }),
            )
    }

    findByCode(kompetensiCode: string): Observable<KompetensiUkom> {
        return this.apiService
            .getData(`${this.BASE_PATH}/code/${kompetensiCode}`)
            .pipe(
                catchError((error) => {
                    console.error('Error fetching data', error)
                    throw error
                }),
            )
    }
}
