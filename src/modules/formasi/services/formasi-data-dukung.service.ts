import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { Observable } from 'rxjs'
import {
    FormasiDataDukungCreateModel,
    FormasiDataDukungModel,
} from '@/modules/formasi/models_v2/formasi-data-dukung.model'
import { catchError } from 'rxjs/operators'
import { FormasiDokumenRequirement } from '@/modules/formasi/models/formasi-dokumen-requirement.model'

@Injectable({
    providedIn: 'root',
})
export class FormasiDataDukungService {
    readonly BASE_PATH = '/api/v1/doc_persyaratan'

    apiService = inject(ApiService)
    handlerService = inject(HandlerService)

    constructor() {}

    fetchDataDukungForFormasi(): Observable<FormasiDataDukungModel[]> {
        return this.apiService
            .getData(`${this.BASE_PATH}/association/for_formasi`)
            .pipe(
                catchError((err) => {
                    this.handlerService.handleException(err)
                    throw err
                }),
            )
    }

    createDataDukungForFormasi(
        payload: FormasiDataDukungCreateModel,
    ): Observable<void> {
        return this.apiService.postData(`${this.BASE_PATH}`, payload).pipe(
            catchError((err) => {
                this.handlerService.handleException(err)
                throw err
            }),
        )
    }

    deleteDataDukung(id: string): Observable<void> {
        return this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
            catchError((err) => {
                this.handlerService.handleException(err)
                throw err
            }),
        )
    }

    fetchPersyaratanDataDukung(): Observable<FormasiDokumenRequirement[]> {
        return this.apiService.getData('/api/v1/formasi_dokumen/all').pipe(
            catchError((err) => {
                this.handlerService.handleException(err)
                throw err
            }),
        )
    }
}
