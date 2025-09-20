import { Injectable } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { BehaviorSubject, catchError, finalize, map, of, tap } from 'rxjs'
import { RatingKinerja } from '../models/rating-kinerja.model'
import { PredikatKinerja } from '@/modules/maintenance/models/predikat-kinerja.model'
@Injectable({
    providedIn: 'root',
})
export class KinerjaService {
    readonly BASE_PATH = '/api/v1'
    private ratingKinerjaListSubject = new BehaviorSubject<RatingKinerja[]>([])
    ratingKinerjaList$ = this.ratingKinerjaListSubject.asObservable()
    private ratingKinerjaListLoadingSubject = new BehaviorSubject<boolean>(
        false,
    )
    isRatingKinerjaListLoading$ =
        this.ratingKinerjaListLoadingSubject.asObservable()

    private predikatKinerjaListSubject = new BehaviorSubject<PredikatKinerja[]>(
        [],
    )
    predikatKinerjaList$ = this.predikatKinerjaListSubject.asObservable()
    private predikatKinerjaListLoadingSubject = new BehaviorSubject<boolean>(
        false,
    )
    isPredikatKinerjaListLoading$ =
        this.predikatKinerjaListLoadingSubject.asObservable()

    constructor(private apiService: ApiService) {}

    fetchRatingKinerja(): void {
        this.ratingKinerjaListLoadingSubject.next(true)
        this.apiService
            .getData(`${this.BASE_PATH}/rating_kinerja`)
            .pipe(
                map((res: RatingKinerja[]) =>
                    res.map((item) => new RatingKinerja(item)),
                ),
                tap((res) => this.ratingKinerjaListSubject.next(res)),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    return of([])
                }),
                finalize(() => {
                    this.ratingKinerjaListLoadingSubject.next(false)
                }),
            )
            .subscribe()
    }

    fetchPredikatKinerja(): void {
        this.predikatKinerjaListLoadingSubject.next(true)
        this.apiService
            .getData(`${this.BASE_PATH}/predikat_kinerja`)
            .pipe(
                map((res: PredikatKinerja[]) =>
                    res.map((item) => new PredikatKinerja(item)),
                ),
                tap((res) => this.predikatKinerjaListSubject.next(res)),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    return of([])
                }),
                finalize(() => {
                    this.predikatKinerjaListLoadingSubject.next(false)
                }),
            )
            .subscribe()
    }
}
