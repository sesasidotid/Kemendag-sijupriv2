import { ApiService } from '@/modules/base/services/api.service'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ImportQuestionRequest } from '../models/ukom-module-refactor/import-question-request.model'

@Injectable({
    providedIn: 'root',
})
export class UkomModulesService {
    readonly BASE_PATH = '/api/v1/ukom_module'

    constructor(private apiService: ApiService) {}

    saveBulk(data: ImportQuestionRequest): Observable<void> {
        return this.apiService.postData(`${this.BASE_PATH}/save/bulk`, data)
    }

    downloadTemplate(examTypeCode: string): Observable<void> {
        return this.apiService.getData(
            `${this.BASE_PATH}/download/${examTypeCode}`,
        )
    }
}
