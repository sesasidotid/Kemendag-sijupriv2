import { Injectable } from '@angular/core'
import { BidangJabatan } from '../models/bidang-jabatan.model'
import {
    BehaviorSubject,
    catchError,
    finalize,
    map,
    Observable,
    of,
    tap,
} from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { AlertService } from '@/modules/base/services/alert.service'

@Injectable({
    providedIn: 'root',
})
export class BidangJabatanService {
    readonly BASE_PATH = '/api/v1/bidang_jabatan'

    private bidangJabatanListSubject = new BehaviorSubject<BidangJabatan[]>([])
    bidangJabatanList$ = this.bidangJabatanListSubject.asObservable()

    private bidangJabatanListLoadingSubject = new BehaviorSubject<boolean>(
        false,
    )
    isBidangJabatanListLoading$ =
        this.bidangJabatanListLoadingSubject.asObservable()

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    // Retain for backward compatibility
    findByCode(code: string): Observable<BidangJabatan> {
        return this.apiService.getData(`${this.BASE_PATH}/${code}`).pipe(
            map((response) => new BidangJabatan(response)),
            catchError((error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.error.message)
                throw error
            }),
        )
    }

    // New method to fetch all bidang jabatan
    findAll(): Observable<BidangJabatan[]> {
        return this.apiService.getData(this.BASE_PATH).pipe(
            map((response: any) => {
                return response.map(
                    (bidangJabatan: { [key: string]: any }) =>
                        new BidangJabatan(bidangJabatan),
                )
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.error.message)
                throw error
            }),
        )
    }

    // New implementation with BehaviorSubject
    fetchBidangJabatan(): void {
        this.bidangJabatanListLoadingSubject.next(true)
        this.apiService
            .getData(this.BASE_PATH)
            .pipe(
                map((res: BidangJabatan[]) =>
                    res.map((item) => new BidangJabatan(item)),
                ),
                tap((res) => {
                    this.bidangJabatanListSubject.next(res)
                }),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    return of([])
                }),
                finalize(() =>
                    this.bidangJabatanListLoadingSubject.next(false),
                ),
            )
            .subscribe()
    }
}
