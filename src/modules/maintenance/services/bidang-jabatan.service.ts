import { Injectable } from '@angular/core'
import { BidangJabatan } from '../models/bidang-jabatan.model'
import { catchError, map, Observable } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { AlertService } from '@/modules/base/services/alert.service'

@Injectable({
    providedIn: 'root',
})
export class BidangJabatanService {
    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    findByCode(code: string): Observable<BidangJabatan> {
        return this.apiService.getData(`/api/v1/bidang_jabatan/${code}`).pipe(
            map((response) => new BidangJabatan(response)),
            catchError((error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.message)
                throw error
            }),
        )
    }
}
