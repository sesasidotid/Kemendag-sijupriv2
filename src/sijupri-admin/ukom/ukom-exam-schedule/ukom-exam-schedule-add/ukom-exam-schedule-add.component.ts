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
import { ExamScheduleUkom } from '../../../../modules/ukom/models/schedule.model'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { RoomUkomDetail } from '../../../../modules/ukom/models/room-ukom-detail'
import { map } from 'rxjs/operators'
import { JenisUkom } from '../../../../modules/ukom/models/jenis-ukom'

@Component({
  selector: 'app-ukom-exam-schedule-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-exam-schedule-add.component.html',
  styleUrl: './ukom-exam-schedule-add.component.scss'
})
export class UkomExamScheduleAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter()

  tab$ = new BehaviorSubject<number | null>(0)

  examScheduleForm: FormGroup
  submitLoading$ = new BehaviorSubject<boolean>(false)

  examScheduleData: ExamScheduleUkom = new ExamScheduleUkom()
  roomList$: Observable<RoomUkomDetail[]>
  jenisUkomList$: Observable<JenisUkom[]>

  constructor (
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.examScheduleForm = new FormGroup({
      id: new FormControl('', Validators.required),
      start_time: new FormControl('', Validators.required),
      end_time: new FormControl('', Validators.required),
      exam_type_code: new FormControl('', Validators.required)
    })
  }

  ngOnInit () {
    this.roomList$ = this.apiService
      .getData(`/api/v1/room_ukom/search?limit=1000`)
      .pipe(
        map(response =>
          response.data.map(
            (room: { [key: string]: any }) => new RoomUkomDetail(room)
          )
        )
      )

    this.roomList$.subscribe(roomList => {
      console.log(roomList)
    })

    this.jenisUkomList$ = this.apiService
      .getData(`/api/v1/exam_type`)
      .pipe(
        map(response =>
          response.map(
            (jenisUkom: { [key: string]: any }) => new JenisUkom(jenisUkom)
          )
        )
      )

    this.jenisUkomList$.subscribe(roomList => {
      console.log(roomList)
    })
  }

  submit (): void {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.submitLoading$.next(true)

        this.examScheduleData.id = this.examScheduleForm.get('id')?.value
        this.examScheduleData.examScheduleDtoList = [
          {
            start_time: this.examScheduleForm.get('start_time')?.value,
            end_time: this.examScheduleForm.get('end_time')?.value,
            exam_type_code: this.examScheduleForm.get('exam_type_code')?.value
          }
        ]
        console.log(this.examScheduleData)

        this.apiService
          .postData(`/api/v1/exam_schedule`, this.examScheduleData)
          .subscribe({
            next: response => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              this.router.navigate(['/ukom/ukom-room-list'])
            },
            error: error => {
              this.handlerService.handleAlert('Error', error.error.message)
            },
            complete: () => {
              this.submitLoading$.next(false)
            }
          })
      }
    })
  }
}
