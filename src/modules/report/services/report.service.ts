import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { Injectable } from '@angular/core'
import { ReportGenerate } from '../models/report-generate.model'
import { ReportDownloadModel } from '../models/report-download.model'
import { catchError, Observable, tap, throwError } from 'rxjs'
@Injectable({
    providedIn: 'root',
})
export class ReportService {
    readonly BASE_PATH = '/api/v1'
    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    generateReport(body: ReportGenerate) {
        return this.apiService
            .postData(`${this.BASE_PATH}/report_generate`, body)
            .pipe(
                tap(() => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Laporan berhasil dibuat',
                    )
                }),
                catchError((error) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal membuat report. Silahkan Coba Lagi',
                    )
                    return throwError(() => error)
                }),
            )
    }

    downloadReport(
        body: ReportDownloadModel,
        expectedFileName: string | undefined,
    ) {
        this.apiService
            .postDownload(
                `${this.BASE_PATH}/report/download`,
                body,
                expectedFileName,
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Laporan berhasil diunduh',
                    )
                },
                error: (error) => {
                    this.handlerService.handleException(error)
                },
            })
    }

    deleteReport(reportId: string): Observable<any> {
        return this.apiService
            .deleteData(`${this.BASE_PATH}/report/${reportId}`)
            .pipe(
                tap(() => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Laporan berhasil dihapus',
                    )
                }),
                catchError((error) => {
                    this.handlerService.handleException(error)
                    return throwError(() => error)
                }),
            )
    }
}
