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
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { RoomUkom } from '../../../../modules/ukom/models/room-ukom.model'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-ukom-class-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule
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

  constructor (
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.kelasForm = new FormGroup({
      name: new FormControl('', Validators.required),
      jabatan: new FormControl('', Validators.required),
      jenjang: new FormControl('', Validators.required),
      participant_quota: new FormControl('', Validators.required),
      exam_start_at: new FormControl('', Validators.required),
      exam_end_at: new FormControl('', Validators.required)
    })
  }

  ngOnInit () {
    this.jabatanList$ = this.apiService
      .getData(`/api/v1/jabatan`)
      .pipe(
        map(response =>
          response.map(
            (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
          )
        )
      )

    this.jabatanList$.subscribe(jabatanList => {
      console.log(jabatanList)
    })

    this.jenjangList$ = this.apiService
      .getData(`/api/v1/jenjang`)
      .pipe(
        map(response =>
          response.map(
            (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
          )
        )
      )
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.submitLoading$.next(true)

        this.kelasData.name = this.kelasForm.get('name')?.value
        this.kelasData.jabatan_code = this.kelasForm.get('jabatan')?.value
        this.kelasData.jenjang_code = this.kelasForm.get('jenjang')?.value
        this.kelasData.participant_quota =
          this.kelasForm.get('participant_quota')?.value
        this.kelasData.exam_start_at =
          this.kelasForm.get('exam_start_at')?.value
        this.kelasData.exam_end_at = this.kelasForm.get('exam_end_at')?.value

        this.apiService
          .postData(`/api/v1/room_ukom`, this.kelasData)
          .subscribe({
            next: (response: any) => {
              this.router.navigate(['/ukom/ukom-room-list'])
            },
            error: error => {
              this.submitLoading$.next(false)
              this.handlerService.handleException(error)
            },
            complete: () => {
              this.submitLoading$.next(false)
              this.router.navigate(['/ukom/ukom-room-list'])
            }
          })
      }
    })
  }
}
