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
import { Jabatan } from '../models/jabatan.model'
import { ApiService } from '../../base/services/api.service'
import { AlertService } from '../../base/services/alert.service'

@Injectable({
    providedIn: 'root',
})
export class JabatanService {
    readonly BASE_PATH = '/api/v1/jabatan'

    private jabatanListSubject = new BehaviorSubject<Jabatan[]>([])
    jabatanList$ = this.jabatanListSubject.asObservable()

    private jabatanListLoadingSubject = new BehaviorSubject<boolean>(false)
    isJabatanListLoading$ = this.jabatanListLoadingSubject.asObservable()

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    //retain for backward compatibility
    findAll(): Observable<Jabatan[]> {
        return this.apiService.getData(this.BASE_PATH).pipe(
            map((response: any) => {
                return response.map(
                    (jabatan: { [key: string]: any }) => new Jabatan(jabatan),
                )
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.error.message)
                throw error
            }),
        )
    }

    findById(id: string): Observable<Jabatan> {
        return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
            map((response: any) => {
                return new Jabatan(response)
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast('Error', error.error.message)
                throw error
            }),
        )
    }

    //new implementation with BehaviorSubject
    fetchJabatan(): void {
        this.jabatanListLoadingSubject.next(true)
        this.apiService
            .getData(this.BASE_PATH)
            .pipe(
                map((res: Jabatan[]) => res.map((item) => new Jabatan(item))),
                tap((res) => {
                    this.jabatanListSubject.next(res)
                }),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    return of([])
                }),
                finalize(() => this.jabatanListLoadingSubject.next(false)),
            )
            .subscribe()
    }
}
