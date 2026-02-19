import { Component, inject, input, output, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import {
    MultiSelectApiComponent,
    MultiSelectApiParams,
} from '@/modules/base/components/multi-select-api'
import { UkomExaminerService } from '@/modules/ukom/services/ukom-examiner.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ApiService } from '@/modules/base/services/api.service'
import { finalize, map, Observable } from 'rxjs'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'

@Component({
    selector: 'app-add-examiner-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ModalComponent,
        LoadingButtonComponent,
        MultiSelectApiComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './add-examiner-modal.component.html',
    styleUrl: './add-examiner-modal.component.scss',
})
export class AddExaminerModalComponent {
    roomId = input.required<string>()
    onToggle = output<void>()
    onSuccess = output<void>()

    examinerService = inject(UkomExaminerService)
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    apiService = inject(ApiService)
    fb = inject(FormBuilder)

    examinerForm: FormGroup
    submitLoading = signal(false)

    constructor() {
        this.initForm()
    }

    initForm() {
        this.examinerForm = this.fb.group({
            examinerIdList: [[], Validators.required],
        })
    }

    fetchExaminers = (params: MultiSelectApiParams): Observable<any> => {
        const searchName = params['like_user|name'] || ''

        return this.examinerService
            .searchExaminerV2({
                limit: params.limit,
                page: params.page,
                searchName: searchName,
            })
            .pipe(
                map((response) => {
                    if (response && response.data) {
                        return {
                            ...response,
                            data: response.data.map((examiner) => ({
                                id: examiner.id,
                                label: examiner.user?.name || examiner.id,
                            })),
                        }
                    }
                    return response
                }),
            )
    }

    handleClose() {
        this.onToggle.emit()
        this.examinerForm.reset()
    }

    submit() {
        if (this.examinerForm.invalid) {
            this.examinerForm.markAllAsTouched()
            return
        }

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading.set(true)

                const payload = {
                    room_id: this.roomId(),
                    examiner_id_list:
                        this.examinerForm.value.examinerIdList || [],
                }

                this.apiService
                    .postData('/api/v1/room_ukom/examiner', payload)
                    .pipe(finalize(() => this.submitLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Penguji berhasil ditambahkan ke kelas',
                            )
                            this.examinerForm.reset()
                            this.onSuccess.emit()
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menambahkan penguji ke kelas',
                            )
                        },
                    })
            },
        })
    }
}
