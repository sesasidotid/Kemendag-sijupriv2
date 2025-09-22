import { Injectable } from '@angular/core'
import { BehaviorSubject, catchError, finalize, map, of, tap } from 'rxjs'
import { Pendidikan } from '../models/pendidikan.model'
import { ApiService } from '@/modules/base/services/api.service'
@Injectable({
    providedIn: 'root',
})
export class PendidikanService {
    readonly BASE_PATH = '/api/v1'

    private pendidikanListSubject = new BehaviorSubject<Pendidikan[]>([])
    pendidikanList$ = this.pendidikanListSubject.asObservable()
    private pendidikanListLoadingSubject = new BehaviorSubject<boolean>(false)
    isPendidikanListLoading$ = this.pendidikanListLoadingSubject.asObservable()

    constructor(private apiService: ApiService) {}

    fetchPendidikan(): void {
        this.pendidikanListLoadingSubject.next(true)
        this.apiService
            .getData(`${this.BASE_PATH}/pendidikan`)
            .pipe(
                map((res: Pendidikan[]) =>
                    res.map((item) => new Pendidikan(item)),
                ),
                tap((res) => this.pendidikanListSubject.next(res)),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    return of([])
                }),
                finalize(() => {
                    this.pendidikanListLoadingSubject.next(false)
                }),
            )
            .subscribe()
    }

    getPendidikanById(code: string): Pendidikan | undefined {
        return this.pendidikanListSubject
            .getValue()
            .find((pendidikan) => pendidikan.code === code)
    }
}
