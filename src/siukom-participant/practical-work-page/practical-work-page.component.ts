import { Component, inject, OnInit, signal } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
    selector: 'app-practical-work-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        InvalidOnTouchDirective,
        LoadingButtonComponent,
    ],
    templateUrl: './practical-work-page.component.html',
    styleUrl: './practical-work-page.component.scss',
})
export class PracticalWorkPageComponent implements OnInit {
    examId = signal('')
    loading = signal(false)
    submitting = signal(false)

    videoForm!: FormGroup

    formValidationService = inject(FormValidationService)
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    router = inject(Router)
    route = inject(ActivatedRoute)
    fb = inject(FormBuilder)

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.examId.set(params.get('examScheduleId'))
            this.initForm()
            this.getUploadedVideoLink()
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.videoForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    initForm() {
        this.videoForm = this.fb.group({
            videoLink: [
                '',
                [Validators.required, Validators.pattern(/https?:\/\/.+/)],
            ],
        })
    }

    getUploadedVideoLink() {
        this.loading.set(true)
        setTimeout(() => {
            this.loading.set(false)
        }, 2000)
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    submitVideoLink() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitting.set(true)
                setTimeout(() => {
                    this.submitting.set(false)
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil mengirim tautan video praktik kerja industri.',
                    )
                    this.videoForm.reset()
                }, 2000)
            },
        })
    }
}
