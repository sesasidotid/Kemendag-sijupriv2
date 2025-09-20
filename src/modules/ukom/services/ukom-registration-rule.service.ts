import { ApiService } from '@/modules/base/services/api.service'
import { Injectable } from '@angular/core'
import { BehaviorSubject, finalize } from 'rxjs'
import { UkomRegistrationRequirement } from '@/modules/ukom/models/ukom-registration-refactored/ukom-registration-rule.model'
import { HandlerService } from '@/modules/base/services/handler.service'
@Injectable({
    providedIn: 'root',
})
export class UkomRegistrationRuleService {
    readonly BASE_PATH = '/api/v1/ukom_registration_rules'

    private registrationRuleListSubject = new BehaviorSubject<
        UkomRegistrationRequirement[]
    >([])
    registrationRuleList$ = this.registrationRuleListSubject.asObservable()

    private registrationRuleListLoadingSubject = new BehaviorSubject<boolean>(
        false,
    )
    registrationRuleListLoading$ =
        this.registrationRuleListLoadingSubject.asObservable()
    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    fetchList() {}

    private createRuleLoadingSubject = new BehaviorSubject<boolean>(false)
    createRuleLoading$ = this.createRuleLoadingSubject.asObservable()
    createRule(data: UkomRegistrationRequirement, onSuccess?: () => void) {
        this.createRuleLoadingSubject.next(true)

        this.apiService
            .postData(this.BASE_PATH, data)
            .pipe(
                finalize(() => {
                    this.createRuleLoadingSubject.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil menambahkan syarat',
                    )
                    onSuccess?.()
                },
                error: (error) => {
                    this.handlerService.handleException(error)
                },
            })
    }

    private deleteRuleLoadingSubject = new BehaviorSubject<boolean>(false)
    deleteRuleLoading$ = this.deleteRuleLoadingSubject.asObservable()
    deleteRule(id: string, onSuccess?: () => void) {
        this.deleteRuleLoadingSubject.next(true)

        this.apiService
            .deleteData(`${this.BASE_PATH}/${id}`)
            .pipe(
                finalize(() => {
                    this.deleteRuleLoadingSubject.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil menghapus syarat',
                    )
                    onSuccess?.()
                },
                error: (err) => {
                    console.log(err)
                    this.handlerService.handleException(err)
                },
            })
    }

    private updateRuleLoadingSubject = new BehaviorSubject<boolean>(false)
    updateRuleLoading$ = this.updateRuleLoadingSubject.asObservable()

    updateRule(body: UkomRegistrationRequirement, onSuccess?: () => void) {
        this.updateRuleLoadingSubject.next(true)

        this.apiService
            .putData(`${this.BASE_PATH}`, body)
            .pipe(
                finalize(() => {
                    this.updateRuleLoadingSubject.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil mengupdate syarat',
                    )
                    onSuccess?.()
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleException(err)
                },
            })
    }
}
