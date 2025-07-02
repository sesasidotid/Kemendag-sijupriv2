import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject, of } from 'rxjs'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { KompetensiUkom } from '../../../../modules/ukom/models/kompetensi'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, startWith, tap } from 'rxjs/operators'
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'
import { BidangJabatan } from '../../../../modules/maintenance/models/bidang-jabatan.model'

@Component({
    selector: 'app-ukom-kompetensi-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        LucideAngularModule
    ],
    templateUrl: './ukom-kompetensi-add.component.html',
    styleUrl: './ukom-kompetensi-add.component.scss'
})
export class UkomKompetensiAddComponent {
    @Output() changeTabActive: EventEmitter<any> = new EventEmitter()
    tab$ = new BehaviorSubject<number | null>(0)
    kompetensiForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)

    kompetensiData: KompetensiUkom = new KompetensiUkom()
    jabatanList$: Observable<Jabatan[]>
    jenjangList$: Observable<Jenjang[]>
    pangkatList$: Observable<Pangkat[]>

    private bidangJabatanListSubject = new BehaviorSubject<BidangJabatan[]>([])
    bidangJabatanList$ = this.bidangJabatanListSubject.asObservable()

    constructor (
        private confirmationService: ConfirmationService,
        private apiService: ApiService,
        private handlerService: HandlerService,
        private formValidationService: FormValidationService
    ) {}

    ngOnInit () {
        this.handleFormInit()
        this.getJabatanList()
        // this.getListJenjang()
        this.handleSubscribe()
    }

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.kompetensiForm.get(controlName),
            controlName,
            label
        )
    }

    handleFormInit () {
        this.kompetensiForm = new FormGroup({
            code: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
            level: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            jabatan_code: new FormControl('', Validators.required),
            jenjang_code: new FormControl('', Validators.required),
            bidang_jabatan_code: new FormControl('')
        })
    }

    handleSubscribe () {
        // this.handleBidangJabatanValidation()
        const bidangJabatanControl = this.kompetensiForm.get(
            'bidang_jabatan_code'
        )
        const jenjangControl = this.kompetensiForm.get('jenjang_code')
        const jabatanControl = this.kompetensiForm.get('jabatan_code')

        jabatanControl?.valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(jabatanCode => {
                bidangJabatanControl?.reset()
                jenjangControl?.reset()
                jenjangControl?.patchValue('')

                if (jabatanCode) {
                    this.getBidangJabatanByJabatanCode(jabatanCode)
                    this.getListJenjang(jabatanCode)
                }
            })
    }

    getJabatanList () {
        this.jabatanList$ = this.apiService
            .getData(`/api/v1/jabatan`)
            .pipe(
                map(response =>
                    response.map(
                        (jabatan: { [key: string]: any }) =>
                            new Jabatan(jabatan)
                    )
                )
            )

        this.jabatanList$.forEach(jabatanList => {
            console.log(jabatanList)
        })
    }

    // getListJenjang () {
    //     this.jenjangList$ = this.apiService
    //         .getData(`/api/v1/jenjang`)
    //         .pipe(
    //             map(response =>
    //                 response.map(
    //                     (jenjang: { [key: string]: any }) =>
    //                         new Jenjang(jenjang)
    //                 )
    //             )
    //         )
    // }
    getListJenjang (jabatanCode: string) {
        this.jenjangList$ = this.apiService
            .getData(`/api/v1/jenjang/jabatan/${jabatanCode}`)
            .pipe(
                map(response =>
                    response.map(
                        (jenjang: { [key: string]: any }) =>
                            new Jenjang(jenjang)
                    )
                )
            )
    }

    getBidangJabatanByJabatanCode (jabatanCode: string): void {
        this.apiService
            .getData(`/api/v1/bidang_jabatan/jabatan/${jabatanCode}`)
            .pipe(
                map((res: any) =>
                    Array.isArray(res)
                        ? res.map(item => new BidangJabatan(item))
                        : []
                )
            )
            .subscribe(list => {
                this.bidangJabatanListSubject.next(list)
            })
    }

    handleBidangJabatanValidation () {
        this.bidangJabatanList$.subscribe(bidangJabatanList => {
            const control = this.kompetensiForm.get('bidang_jabatan_code')
            if (!control) return

            const currentValidators = control.validator
                ? [control.validator]
                : []
            const isRequiredAlreadySet = currentValidators.some(
                v => v === Validators.required
            )

            if (bidangJabatanList.length > 0 && !isRequiredAlreadySet) {
                control.setValidators([Validators.required])
            } else if (bidangJabatanList.length === 0) {
                control.clearValidators()
            }

            control.updateValueAndValidity({ emitEvent: false })
        })
    }

    submit () {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return

                this.kompetensiData.code =
                    this.kompetensiForm.get('code')?.value
                this.kompetensiData.name =
                    this.kompetensiForm.get('name')?.value
                this.kompetensiData.level =
                    this.kompetensiForm.get('level')?.value
                this.kompetensiData.description =
                    this.kompetensiForm.get('description')?.value
                this.kompetensiData.jabatan_code =
                    this.kompetensiForm.get('jabatan_code')?.value
                this.kompetensiData.jenjang_code =
                    this.kompetensiForm.get('jenjang_code')?.value
                this.kompetensiData.bidang_jabatan_code =
                    this.kompetensiForm.get('bidang_jabatan_code')?.value

                this.apiService
                    .postData(`/api/v1/kompetensi`, this.kompetensiData)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan'
                            )

                            this.kompetensiForm.reset()
                        },
                        error: () => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Data gagal disimpan'
                            )
                        }
                    })
            }
        })
    }
}
