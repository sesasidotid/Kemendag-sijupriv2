import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Instrument } from '../../../modules/akp/models/instrument.model'
import { Router, RouterLink } from '@angular/router'
import { AlertService } from '../../../modules/base/services/alert.service'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { TabService } from '../../../modules/base/services/tab.service'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { AkpTaskService } from '../../../modules/akp/services/akp-task.service'
import { VerifAKPTask } from '../../../modules/akp/models/verif-akp-task.model'

@Component({
  selector: 'app-akp-task-list',
  standalone: true,
  imports: [
    PagableComponent,
    ModalComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './akp-task-list.component.html',
  styleUrl: './akp-task-list.component.scss'
})
export class AKPTaskComponent {
  form!: FormGroup
  instrumentList: Instrument[]
  pagable: Pagable

  payload = new VerifAKPTask()
  submitButtonLoading$ = new BehaviorSubject<boolean>(false)

  isModalOpen$ = new BehaviorSubject<boolean>(false)
  taskId$ = new BehaviorSubject<string>('')
  action$ = new BehaviorSubject<'approve' | 'reject'>('approve')
  pagable$ = new BehaviorSubject<Pagable | null>(null)

  constructor (
    private tabService: TabService,
    private akpTaskService: AkpTaskService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.pagable$.next(
      new PagableBuilder('/api/v1/akp/task/search')
        .addPrimaryColumn(
          new PrimaryColumnBuilder('NIP', 'objectGroup').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Nama AKP', 'objectName')
            // .withSortable(false)
            .build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Proses', 'flowName')
            // .withSortable(false)
            .build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Status', 'taskStatus')
            // .withSortable(false)
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((task: any) => {
              this.router.navigate([`/akp/akp-task-list/${task.id}`])
            }, 'info')
            .addInactiveCondition((task: any) => task.flowId === 'akp_flow_1')
            .withIcon('detail')
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((task: any) => {
              this.taskId$.next(task.id)
              this.toggleModal()
            }, 'primary')
            .addInactiveCondition((task: any) => task.flowId !== 'akp_flow_1')
            .withIcon('update')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('equal')
            .setProperty('flowId')
            .withDefaultValue('akp_flow_1')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('objectGroup')
            .withField('NIP', 'text')
            .build()
        )
        .build()
    )

    this.form = new FormGroup({
      nama_atasan: new FormControl('', [Validators.required]),
      email_atasan: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      remark: new FormControl('', [Validators.required])
    })
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Verifikasi Pengajuan',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handlePagableTabChange('akp_flow_1', 0)
      })
      .addTab({
        label: 'Penilaian Atasan/Rekan',
        icon: 'mdi-account-supervisor',
        onClick: () => this.handlePagableTabChange('akp_flow_2', 1)
      })
      .addTab({
        label: 'Penilaian Personal',
        icon: 'mdi-account',
        onClick: () => this.handlePagableTabChange('akp_flow_3', 2)
      })
  }

  handlePagableTabChange (tab: string, tabIndex: number) {
    const currentPagable = this.pagable$.value

    const updatedPagable = {
      ...currentPagable,
      filterLIst: currentPagable.filterLIst.map((item, index) =>
        item.key === 'eq_flowId' ? { ...item, value: tab } : item
      )
    }

    this.tabService.changeTabActive(tabIndex)
    this.pagable$.next(updatedPagable)
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  handleSave () {
    this.submitButtonLoading$.next(true)

    if (this.action$.value === 'approve') {
      if (
        this.form.get('nama_atasan').valid &&
        this.form.get('email_atasan').valid
      ) {
        this.payload.id = this.taskId$.value
        this.payload.taskAction = 'approve'
        this.payload.object = {
          emailAtasan: this.form.get('email_atasan').value,
          namaAtasan: this.form.get('nama_atasan').value
        }

        console.log(this.payload)

        this.akpTaskService.verifAKPTask(this.payload).subscribe({
          next: () => {
            this.alertService.showToast(
              'Success',
              'Berhasil menerima pengajuan AKP.'
            )
            this.toggleModal()
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          },
          error: error => {
            this.alertService.showToast(
              'Error',
              'Gagal menerima pengajuan AKP.'
            )
            this.toggleModal()
          },
          complete: () => {
            this.submitButtonLoading$.next(false)
          }
        })
      }
    } else if (this.action$.value === 'reject') {
      if (this.form.get('remark').valid) {
        this.payload.id = this.taskId$.value
        this.payload.taskAction = 'reject'
        this.payload.remark = this.form.get('remark').value

        console.log(this.payload)
        // return
        this.akpTaskService.verifAKPTask(this.payload).subscribe({
          next: () => {
            this.alertService.showToast(
              'Success',
              'Berhasil menolak pengajuan AKP.'
            )
            this.toggleModal()
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          },
          error: error => {
            this.alertService.showToast('Error', 'Gagal menolak pengajuan AKP.')
            this.toggleModal()
          },
          complete: () => {
            this.submitButtonLoading$.next(false)
          }
        })
      }
    }
  }
}
