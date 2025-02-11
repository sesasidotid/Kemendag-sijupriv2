import { JenisKelamin } from '../../../../modules/maintenance/models/jenis-kelamin.model'
import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { TabService } from '../../../../modules/base/services/tab.service'
import { Router, RouterLink } from '@angular/router'
import { UkomExaminerAddComponent } from '../ukom-examiner-add/ukom-examiner-add.component'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
@Component({
  selector: 'app-ukom-examiner-list',
  standalone: true,
  imports: [
    PagableComponent,
    CommonModule,
    UkomExaminerAddComponent,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-examiner-list.component.html',
  styleUrl: './ukom-examiner-list.component.scss'
})
export class UkomExaminerListComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  pagable: Pagable
  refreshToggle: boolean = false

  isModalOpen$ = new BehaviorSubject<boolean>(false)
  editExaminerForm: FormGroup

  constructor (
    private tabService: TabService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService,
    private apiService: ApiService
  ) {
    this.pagable = new PagableBuilder('/api/v1/examiner_ukom/search')
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'name', ['user']).build()
      )
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenis Kelamin', (data: any) =>
            data.jenisKelaminCode === 'M'
              ? 'Laki Laki'
              : data.jenisKelaminCode === 'F'
              ? 'Perempuan'
              : data.jenisKelaminCode
          )
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Status', 'status', ['user']).build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            this.setDefaultFormValues(data)
            this.toggleModal()
          }, 'primary')
          .withIcon('update')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name', ['user'])
          .withField('Nama', 'text')
          .build()
      )
      .build()

    this.editExaminerForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      nip: new FormControl('', Validators.required),
      jenis_kelamin_code: new FormControl('', Validators.required)
    })
  }

  setDefaultFormValues (data: any) {
    console.log('data', data)
    this.editExaminerForm.patchValue({
      id: data.id || '',
      name: data.user.name || '',
      nip: data.nip || '',
      jenis_kelamin_code: data.jenisKelaminCode || ''
    })
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar Examiner',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Examiner',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  handleTabChange (tab?: number) {
    console.log('tab', tab)
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  handleRefreshToggle () {
    this.refreshToggle = !this.refreshToggle
  }

  submit () {
    const payload = {
      id: this.editExaminerForm.value.id,
      name: this.editExaminerForm.value.name,
      nip: this.editExaminerForm.value.nip,
      jenis_kelamin_code: this.editExaminerForm.value.jenis_kelamin_code
    }

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService.putData('/api/v1/examiner_ukom', payload).subscribe({
          next: response => {
            this.handlerService.handleAlert(
              'Success',
              'Berhasil menambahkan data'
            )
            this.handleRefreshToggle()
            this.toggleModal()
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          },
          error: error => this.handlerService.handleException(error)
        })
      }
    })
  }
}
