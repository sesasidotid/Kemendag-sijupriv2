import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { catchError, Observable } from 'rxjs'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import {
    IndikatorKompetensiQueryParams,
    IndikatorKompetensiUkom,
} from '@/modules/ukom/models/indikator-kompetensi'
import { HttpParams } from '@angular/common/http'

@Injectable({
    providedIn: 'root',
})
export class IndikatorService {
    readonly BASE_PATH = '/api/v1/kompetensi_indikator'

    apiService = inject(ApiService)

    constructor() {}

    searchAll(
        queryParams: IndikatorKompetensiQueryParams,
    ): Observable<PaginationWrapper<IndikatorKompetensiUkom>> {
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

    findById(
        kompetensiIndikatorId: string,
    ): Observable<IndikatorKompetensiUkom> {
        return this.apiService
            .getData(`${this.BASE_PATH}/${kompetensiIndikatorId}`)
            .pipe(
                catchError((error) => {
                    console.error('Error fetching data', error)
                    throw error
                }),
            )
    }
}
