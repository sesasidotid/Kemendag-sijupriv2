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
import { BehaviorSubject } from 'rxjs'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ExaminerUkom } from '../../../../modules/ukom/models/examiner.model'
import { HandlerService } from '../../../../modules/base/services/handler.service'

@Component({
  selector: 'app-ukom-examiner-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-examiner-add.component.html',
  styleUrl: './ukom-examiner-add.component.scss'
})
export class UkomExaminerAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter()

  examinerForm: FormGroup
  submitLoading$ = new BehaviorSubject<boolean>(false)

  examinerData: ExaminerUkom = new ExaminerUkom()

  constructor (
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.examinerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      nip: new FormControl('', Validators.required),
      jenis_kelamin_code: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [
        Validators.required,
        this.passwordMatchValidator.bind(this)
      ])
    })
  }

  passwordMatchValidator (
    control: FormControl
  ): { [key: string]: boolean } | null {
    if (this.examinerForm) {
      const password = this.examinerForm.get('password')?.value
      const confirmPassword = control.value
      if (password !== confirmPassword) {
        return { mismatch: true }
      }
    }
    return null
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.examinerData.name = this.examinerForm.get('name').value
        this.examinerData.nip = this.examinerForm.get('nip').value
        this.examinerData.jenis_kelamin_code =
          this.examinerForm.get('jenis_kelamin_code').value
        this.examinerData.password = this.examinerForm.get('password').value

        console.log('examinerData', this.examinerData)

        this.apiService
          .postData('/api/v1/examiner_ukom', this.examinerData)
          .subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              //   this.router.navigate(['/ukom/ukom-examiner-list'])
              this.changeTabActive.emit(0)
            },
            error: () => {
              this.handlerService.handleAlert('Error', 'Data gagal disimpan')
            },
            complete: () => {
              this.submitLoading$.next(false)
              this.router.navigate(['/ukom/ukom-examiner-list'])
            }
          })
      }
    })
  }
}
