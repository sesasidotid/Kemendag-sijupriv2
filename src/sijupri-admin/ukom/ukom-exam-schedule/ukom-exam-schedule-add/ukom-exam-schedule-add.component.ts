import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { LucideAngularModule, FilePlus } from 'lucide-angular'
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormArray
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { Router, RouterLink, ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ExamScheduleUkom } from '../../../../modules/ukom/models/schedule.model'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { RoomUkomDetail } from '../../../../modules/ukom/models/room-ukom-detail'
import { map } from 'rxjs/operators'
import { JenisUkom } from '../../../../modules/ukom/models/jenis-ukom'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { ExamScheduleUkomList } from '../../../../modules/ukom/models/exam-scheduleDtoList'

@Component({
  selector: 'app-ukom-exam-schedule-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule,
    PagableComponent
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
  jenisUkomList$: Observable<JenisUkom[]>

  id: string
  pagable: Pagable
  readonly filePlus = FilePlus
  refreshToggle: boolean = false
  ukom_type: string = undefined

  constructor (
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.examScheduleForm = this.fb.group({
      schedules: this.fb.array([], [Validators.required]) // Ensures at least one schedule exists
    })

    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })

    this.pagable = new PagableBuilder(`/api/v1/exam_schedule/room/${this.id}`)
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Waktu Mulai', 'startTime').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Waktu selesai', 'endTime').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jenis Ukom', 'examTypeCode').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((item: any) => {
            this.router.navigate(
              [`ukom/ukom-room-list/${this.id}/competence/${item.id}`],
              { queryParams: { type_ukom: item.examTypeCode } }
            )
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .build()
  }

  ngOnInit () {
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

    this.addSchedule()
  }

  get schedules () {
    return this.examScheduleForm.get('schedules') as FormArray
  }

  addSchedule (): void {
    const scheduleGroup = this.fb.group({
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      exam_type_code: ['', Validators.required]
    })
    this.schedules.push(scheduleGroup)
  }

  removeSchedule (index: number): void {
    this.schedules.removeAt(index)
  }

  getAvailableExamTypes (selectedCode: string): Observable<JenisUkom[]> {
    return this.jenisUkomList$.pipe(
      map(jenisUkomList => {
        const selectedCodes = this.schedules.value.map(
          (schedule: any) => schedule.exam_type_code
        )
        return jenisUkomList.filter(
          jenisUkom =>
            !selectedCodes.includes(jenisUkom.code) ||
            jenisUkom.code === selectedCode
        )
      })
    )
  }
  handleRefreshToggle () {
    this.refreshToggle = !this.refreshToggle
  }
  submit (): void {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.submitLoading$.next(true)

        this.examScheduleData.id = this.id

        const schedules = this.schedules.value.map((schedule: any) => ({
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          exam_type_code: schedule.exam_type_code
        }))

        const payload = {
          id: this.id,
          examScheduleDtoList: schedules
        }

        const examTypeCodes = this.schedules.value.map(
          (schedule: any) => schedule.exam_type_code
        )
        const hasDuplicate = examTypeCodes.some(
          (value: any, index: any) => examTypeCodes.indexOf(value) !== index
        )

        if (hasDuplicate) {
          this.handlerService.handleAlert(
            'Error',
            'Jenis UKOM tidak boleh sama'
          )
          this.submitLoading$.next(false)
          return
        }

        console.log(payload)
        this.examScheduleData.examScheduleDtoList = this.schedules.value

        this.apiService
          .postData(`/api/v1/exam_schedule`, this.examScheduleData)
          .subscribe({
            next: response => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              this.handleRefreshToggle()
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
