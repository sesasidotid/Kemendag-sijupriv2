import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { TabService } from '../../../../modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { BehaviorSubject } from 'rxjs'
import { UkomClassAddComponent } from '../ukom-class-add/ukom-class-add.component'
import { UkomExamScheduleAddComponent } from '../../ukom-exam-schedule/ukom-exam-schedule-add/ukom-exam-schedule-add.component'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { UkomClassEditComponent } from '../ukom-class-edit/ukom-class-edit.component'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
@Component({
  selector: 'app-ukom-class-list',
  standalone: true,
  imports: [
    PagableComponent,
    CommonModule,
    UkomClassAddComponent,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-class-list.component.html',
  styleUrl: './ukom-class-list.component.scss'
})
export class UkomClassListComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  fixedJenjangList$: Observable<Jenjang[]>

  jenjangMap: Record<string, string> = {}
  jabatanMap: Record<string, string> = {}

  //   pagable$: Observable<Pagable>
  pagable$ = new BehaviorSubject<Pagable | null>(null)
  data: any[] = []
  refreshToggle: boolean = false

  isModalOpen$ = new BehaviorSubject<boolean>(false)

  editRoomUkomForm: FormGroup
  submitLoading$ = new BehaviorSubject<boolean>(false)

  constructor (
    private tabService: TabService,
    private router: Router,
    private handlerService: HandlerService,
    private apiService: ApiService,
    private confirmationService: ConfirmationService
  ) {
    this.pagable$.next(
      new PagableBuilder('/api/v1/room_ukom/search')

        .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Kuota Peserta', 'participantQuota').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Mulai', 'examStartAt').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Selesai', 'examEndAt').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder()
            .withDynamicValue(
              'Jabatan',
              (data: any) => this.jabatanMap[data.jabatanCode]
            )
            .build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder()
            .withDynamicValue(
              'Jenjang',
              (data: any) => this.jenjangMap[data.jenjangCode] || ''
            )
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((ukom: any) => {
              this.router.navigate([`ukom/ukom-room-list/${ukom.id}`])
            }, 'info')
            .withIcon('detail')
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((data: any) => {
              this.setDefaultFormValues(data)
              this.toggleModal()
              this.getListJenjang(data.jabatanCode)
            }, 'primary')
            .withIcon('update')
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction(
              (ukom: any) =>
                this.confirmationService.open(false).subscribe({
                  next: (result: any) => {
                    if (result) {
                      if (!result.confirmed) return

                      this.apiService
                        .deleteData(`/api/v1/room_ukom/${ukom.id}`)
                        .subscribe({
                          next: (response: any) => {
                            this.handlerService.handleAlert(
                              'Success',
                              'Data berhasil dihapus'
                            )

                            this.refreshPagableData()
                          },
                          error: (err: any) => {
                            if (err.error.code == 'UKM-00001') {
                              this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus kelas. Kelas memiliki jadwal ujian'
                              )
                              return
                            }

                            this.handlerService.handleAlert(
                              'Error',
                              'Gagal menghapus data'
                            )
                          }
                        })
                    }
                  }
                }),
              'danger'
            )
            .withIcon('danger')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('name')
            .withField('Nama', 'text')
            .build()
        )
        .build()
    )

    this.editRoomUkomForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      jabatan_code: new FormControl('', Validators.required),
      jenjang_code: new FormControl('', Validators.required),
      participant_quota: new FormControl('', Validators.required),
      vid_call_link: new FormControl('', Validators.required),
      exam_start_at: new FormControl('', Validators.required),
      exam_end_at: new FormControl('', Validators.required)
    })
  }

  refreshPagableData () {
    const currentPagable = this.pagable$.value

    const updatedPagable = {
      ...currentPagable,
      limit: 10
    }
    this.pagable$.next(updatedPagable)
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.getJenjang()
    this.getJabatan()

    this.tabService
      .addTab({
        label: 'Daftar Kelas',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Kelas',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  setDefaultFormValues (data: any) {
    console.log('data', data)
    this.editRoomUkomForm.patchValue({
      id: data.id || '',
      name: data.name || '',
      jabatan_code: data.jabatanCode || '',
      jenjang_code: data.jenjangCode || '',
      participant_quota: data.participantQuota || '',
      vid_call_link: data.vidCallLink || '',
      exam_start_at: data.examStartAt || '',
      exam_end_at: data.examEndAt || ''
    })
  }

  onJabatanSwitch (event: Event) {
    const jabatanCode = (event.target as HTMLSelectElement).value

    if (jabatanCode) {
      this.getListJenjang(jabatanCode)
    }
  }

  getListJenjang (jabatanCode?: string) {
    this.apiService
      .getData(`/api/v1/jenjang/jabatan/${jabatanCode}`)
      .subscribe({
        next: (response: any) => {
          const jenjangs = response.map(
            (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
          )

          jenjangs.forEach((jenjang: any) => {
            this.jenjangMap[jenjang.code] = jenjang.name
          })

          this.fixedJenjangList$ = new BehaviorSubject(jenjangs).asObservable()
        },
        error: err => {
          console.error('Error fetching jenjang data:', err)
        }
      })
  }

  getJenjang (jabatanCode?: string) {
    this.apiService.getData(`/api/v1/jenjang/`).subscribe({
      next: (response: any) => {
        const jenjangs = response.map(
          (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
        )

        jenjangs.forEach((jenjang: any) => {
          this.jenjangMap[jenjang.code] = jenjang.name
        })

        this.jenjangList$ = new BehaviorSubject(jenjangs).asObservable()
      },
      error: err => {
        console.error('Error fetching jenjang data:', err)
      }
    })
  }

  getJabatan () {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: (response: any) => {
        const jabatans = response.map(
          (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
        )

        jabatans.forEach((jabatan: any) => {
          this.jabatanMap[jabatan.code] = jabatan.name
        })

        this.jabatanList$ = new BehaviorSubject(jabatans).asObservable()
      },
      error: err => {
        console.error('Error fetching jabatan data:', err)
      }
    })
  }

  handleRefreshToggle () {
    this.refreshToggle = !this.refreshToggle
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  handleTabChange (tab?: number) {
    console.log('tab', tab)

    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }

  submit () {
    const payload = {
      id: this.editRoomUkomForm.value.id,
      name: this.editRoomUkomForm.value.name,
      jabatan_code: this.editRoomUkomForm.value.jabatan_code,
      jenjang_code: this.editRoomUkomForm.value.jenjang_code,
      participant_quota: this.editRoomUkomForm.value.participant_quota,
      vid_call_link: this.editRoomUkomForm.value.vid_call_link,
      exam_start_at: this.editRoomUkomForm.value.exam_start_at,
      exam_end_at: this.editRoomUkomForm.value.exam_end_at
    }

    // console.log('payload', payload)
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        this.submitLoading$.next(true)

        this.apiService.putData('/api/v1/room_ukom', payload).subscribe({
          next: response => {
            this.handlerService.handleAlert('Success', 'Berhasil mengubah data')
            this.handleRefreshToggle()
            this.toggleModal()
            this.submitLoading$.next(false)
          },
          error: error => {
            console.log('error', error)
            this.handlerService.handleAlert('Error', 'Gagal mengubah data')
            this.submitLoading$.next(false)
          }
        })
      }
    })
  }
}
