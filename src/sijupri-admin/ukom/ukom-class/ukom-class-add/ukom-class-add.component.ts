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
import { ApiService } from '../../../../modules/base/services/api.service'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { RoomUkom } from '../../../../modules/ukom/models/room-ukom.model'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { distinctUntilChanged, finalize, map } from 'rxjs/operators'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'
import { BidangJabatan } from '../../../../modules/maintenance/models/bidang-jabatan.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-ukom-class-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ReactiveFormsModule,
        LoadingButtonComponent
    ],
    templateUrl: './ukom-class-add.component.html',
    styleUrl: './ukom-class-add.component.scss'
})
export class UkomClassAddComponent {
    @Output() changeTabActive: EventEmitter<any> = new EventEmitter()

    tab$ = new BehaviorSubject<number | null>(0)

    kelasForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)

    kelasData: RoomUkom = new RoomUkom()
    jabatanList$: Observable<Jabatan[]>
    jenjangList$: Observable<Jenjang[]>

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
        this.handleBidangJabatanValidation()
    }

    handleBidangJabatanValidation () {
        this.bidangJabatanList$.subscribe(bidangJabatanList => {
            const control = this.kelasForm.get('bidang_jabatan_code')
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

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.kelasForm.get(controlName),
            controlName,
            label
        )
    }

    handleFormInit () {
        this.kelasForm = new FormGroup({
            name: new FormControl('', Validators.required),
            jabatan_code: new FormControl('', Validators.required),
            jenjang_code: new FormControl('', Validators.required),
            bidang_jabatan_code: new FormControl(''),
            participant_quota: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d+$/)
            ]),
            vid_call_link: new FormControl('', Validators.required),
            exam_start_at: new FormControl('', Validators.required),
            exam_end_at: new FormControl('', Validators.required)
        })
    }

    setupInstansiValidation () {
        this.bidangJabatanList$.subscribe(bidangList => {
            const bidangJabatanControl = this.kelasForm.get(
                'bidang_jabatan_code'
            )

            if (bidangList.length > 0) {
                bidangJabatanControl?.setValidators(Validators.required)
            } else {
                bidangJabatanControl?.clearValidators()
            }
            bidangJabatanControl?.updateValueAndValidity()
        })
    }

    handleSubscribe () {
        const jabatanControl = this.kelasForm.get('jabatan_code')
        const bidangJabatanControl = this.kelasForm.get('bidang_jabatan_code')
        const jenjangControl = this.kelasForm.get('jenjang_code')

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

    submit () {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return

                this.submitLoading$.next(true)

                // this.kelasData.name = this.kelasForm.get('name')?.value
                // this.kelasData.jabatan_code =
                //     this.kelasForm.get('jabatan')?.value
                // this.kelasData.jenjang_code =
                //     this.kelasForm.get('jenjang')?.value
                // this.kelasData.participant_quota =
                //     this.kelasForm.get('participant_quota')?.value
                // this.kelasData.vid_call_link =
                //     this.kelasForm.get('vid_call_link')?.value
                // this.kelasData.exam_start_at =
                //     this.kelasForm.get('exam_start_at')?.value
                // this.kelasData.exam_end_at =
                //     this.kelasForm.get('exam_end_at')?.value
                // this.kelasData.bidang_jabatan_code =
                //     this.kelasForm.get('bidang_jabatan')?.value

                this.kelasData = new RoomUkom(this.kelasForm.value)

                this.apiService
                    .postData(`/api/v1/room_ukom`, this.kelasData)
                    .pipe(
                        finalize(() => {
                            this.submitLoading$.next(false)
                        })
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menambahkan data kelas'
                            )
                            this.changeTabActive.emit(0)
                        },
                        error: error => {
                            console.log(error)
                            this.handlerService.handleAlert(
                                'Info',
                                'Gagal menambahkan data kelas'
                            )
                        }
                    })
            }
        })
    }
}
