import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { BehaviorSubject, catchError, finalize, of } from 'rxjs'
import { Injectable } from '@angular/core'
import { DokumenUkom } from '../models/ukom-registration-refactored/document.model'
@Injectable({
    providedIn: 'root',
})
export class UkomDocumentService {
    readonly BASE_PATH = '/api/v1/document_ukom'

    private createDocumentLoadingSubject = new BehaviorSubject<boolean>(false)
    createDocumentLoading$ = this.createDocumentLoadingSubject.asObservable()

    private updateDocumentLoadingSubject = new BehaviorSubject<boolean>(false)
    updateDocumentLoading$ = this.updateDocumentLoadingSubject.asObservable()

    private deleteDocumentLoadingSubject = new BehaviorSubject<boolean>(false)
    deleteDocumentLoading$ = this.deleteDocumentLoadingSubject.asObservable()

    private getDocumentByJenisUkomLoadingSubject = new BehaviorSubject<boolean>(
        false,
    )
    getDocumentByJenisUkomLoading$ =
        this.getDocumentByJenisUkomLoadingSubject.asObservable()
    private documentByJenisUkomSubject = new BehaviorSubject<DokumenUkom[]>([])
    documentByJenisUkom$ = this.documentByJenisUkomSubject.asObservable()

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    createDocument(data: DokumenUkom, onSuccess?: () => void) {
        this.createDocumentLoadingSubject.next(true)
        this.apiService
            .postData(`${this.BASE_PATH}/dokumen_persyaratan`, data)
            .pipe(
                finalize(() => {
                    this.createDocumentLoadingSubject.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil menambahkan dokumen',
                    )
                    onSuccess?.()
                },
                error: (error) => {
                    this.handlerService.handleException(error)
                },
            })
    }

    updateDocument(data: DokumenUkom, onSuccess?: () => void) {
        this.updateDocumentLoadingSubject.next(true)

        this.apiService
            .putData(`${this.BASE_PATH}/dokumen_persyaratan`, data)
            .pipe(
                finalize(() => {
                    this.updateDocumentLoadingSubject.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil memperbarui dokumen',
                    )
                    onSuccess?.()
                },
                error: (error) => {
                    this.handlerService.handleException(error)
                },
            })
    }

    deleteDocument(id: string, onSuccess?: () => void) {
        this.deleteDocumentLoadingSubject.next(true)
        this.apiService
            .deleteData(`/api/v1/doc_persyaratan/${id}`)
            .pipe(
                finalize(() => {
                    this.deleteDocumentLoadingSubject.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil menghapus dokumen',
                    )
                    onSuccess?.()
                },
                error: (error) => {
                    this.handlerService.handleException(error)
                },
            })
    }

    getDocumentByJenisUkom(jenisUkom: string) {
        this.getDocumentByJenisUkomLoadingSubject.next(true)
        this.apiService
            .getData(`${this.BASE_PATH}/jenis_ukom/${jenisUkom}`)
            .pipe(
                catchError((error) => {
                    return of([])
                }),
                finalize(() => {
                    this.getDocumentByJenisUkomLoadingSubject.next(false)
                }),
            )
            .subscribe({
                next: (res: DokumenUkom[]) => {
                    this.documentByJenisUkomSubject.next(res)
                },
            })
    }

    getDocumentParticipantByTaskID(id: string) {
        return this.apiService.getData(`${this.BASE_PATH}/participant/${id}`)
    }
}
