import { inject, Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { catchError } from 'rxjs/operators'
import { SuratRekomModel } from '@/modules/ukom/models/surat-rekom/surat-rekom.model'
import { CreatePreviewSuratRekomRequest } from '@/modules/ukom/models/surat-rekom/create-preview-surat-rekom-request.model'

@Injectable({
    providedIn: 'root',
})
export class SuratRekomService {
    readonly BASE_PATH = '/api/v1/surat_rekom'

    apiService = inject(ApiService)
    handlerService = inject(HandlerService)
    constructor() {}

    searchSuratRekom(): Observable<PaginationWrapper<SuratRekomModel>> {
        return this.apiService.getData(`${this.BASE_PATH}/search`).pipe(
            catchError((err) => {
                console.error(err)
                this.handlerService.handleException(err)
                throw err
            }),
        )
    }

    previewSuratRekom(): Observable<{
        baseTemplate: string
        template: string
    }> {
        return this.apiService
            .getData(`${this.BASE_PATH}/template/REKOM_UKOM`)
            .pipe(
                catchError((err) => {
                    console.error(err)
                    this.handlerService.handleException(err)
                    throw err
                }),
            )
    }

    setupSuratRekom(
        payload: CreatePreviewSuratRekomRequest,
    ): Observable<string> {
        const body = {
            code: 'REKOM_UKOM',
            parameters: {
                bulan: payload.bulan,
                tahun: payload.tahun,
                tanggal: payload.tanggal,
                jabatanPenandatangan: payload.jabatanPenandatangan,
                namaPenandatangan: payload.namaPenandatangan,
                nipPenandatangan: payload.nipPenandatangan,
                kopImg: payload.kopImg,
                numCode1: payload.numCode1,
                numCode3: payload.numCode3,
                numCode4: payload.numCode4,
                ditetapkan: payload.ditetapkan,
            },
        }
        return this.apiService.postData(`${this.BASE_PATH}`, body).pipe(
            catchError((err) => {
                console.error(err)
                this.handlerService.handleException(err)
                throw err
            }),
        )
    }

    downloadRarSuratRekom(id: string) {
        return this.apiService
            .getDownload(`${this.BASE_PATH}/download/${id}`)
            .pipe(
                catchError((err) => {
                    console.error(err)
                    this.handlerService.handleException(err)
                    throw err
                }),
            )
    }

    generateSuratRekom() {
        return this.apiService
            .postData(`${this.BASE_PATH}/generate_ukom`, {})
            .pipe(
                catchError((err) => {
                    console.error(err)
                    this.handlerService.handleException(err)
                    throw err
                }),
            )
    }
}
