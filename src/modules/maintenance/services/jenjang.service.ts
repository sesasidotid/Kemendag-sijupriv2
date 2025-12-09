import { Injectable } from '@angular/core'
import {
    BehaviorSubject,
    catchError,
    finalize,
    map,
    Observable,
    of,
    tap,
} from 'rxjs'
import { ApiService } from '../../base/services/api.service'
import { AlertService } from '../../base/services/alert.service'
import { Jenjang } from '../models/jenjang.modle'

@Injectable({
    providedIn: 'root',
})
export class JenjangService {
    readonly BASE_PATH = '/api/v1/jenjang'

    private jenjangListSubject = new BehaviorSubject<Jenjang[]>([])
    jenjangList$ = this.jenjangListSubject.asObservable()

    private jenjangListLoadingSubject = new BehaviorSubject<boolean>(false)
    isJenjangListLoading$ = this.jenjangListLoadingSubject.asObservable()
    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    //retain for backward compatibility
    findAll(): Observable<Jenjang[]> {
        return this.apiService.getData(this.BASE_PATH).pipe(
            map((response: any) => {
                return response.map(
                    (jenjang: { [key: string]: any }) => new Jenjang(jenjang),
                )
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.error.message)
                throw error
            }),
        )
    }

    findById(id: string): Observable<Jenjang> {
        return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
            map((response: any) => {
                return new Jenjang(response)
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.error.message)
                throw error
            }),
        )
    }

    // New method to fetch and update the jenjang list
    fetchJenjang(): void {
        this.jenjangListLoadingSubject.next(true)
        this.apiService
            .getData(this.BASE_PATH)
            .pipe(
                map((res: Jenjang[]) => res.map((item) => new Jenjang(item))),
                tap((res) => this.jenjangListSubject.next(res)),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    return of([])
                }),
                finalize(() => this.jenjangListLoadingSubject.next(false)),
            )
            .subscribe()
    }
}
