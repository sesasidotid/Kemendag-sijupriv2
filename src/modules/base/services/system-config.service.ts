import { Injectable } from '@angular/core'
import { ApiService } from './api.service'
import { SystemConfig } from '../models/system-config.model'
import { BehaviorSubject, catchError, finalize, map, of } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class SystemConfigService {
    readonly BASE_PATH = '/api/v1/sys_conf'

    private isRegisterOpenSubject = new BehaviorSubject<boolean | null>(null)
    isRegisterOpen$ = this.isRegisterOpenSubject.asObservable()

    private isLoadingSubject = new BehaviorSubject<boolean>(false)
    isLoading$ = this.isLoadingSubject.asObservable()

    constructor(private apiService: ApiService) {}

    checkUkomRegistration() {
        this.isLoadingSubject.next(true)

        this.apiService
            .getData(`${this.BASE_PATH}/UKM_REGISTRATION`)
            .pipe(
                map((res) => {
                    const config = new SystemConfig(res)
                    return config.value?.toLowerCase() === 'ya'
                }),
                catchError((err) => {
                    console.error(err)
                    return of(false)
                }),
                finalize(() => {
                    this.isLoadingSubject.next(false)
                }),
            )
            .subscribe((isOpen) => {
                this.isRegisterOpenSubject.next(isOpen)
            })
    }
}
