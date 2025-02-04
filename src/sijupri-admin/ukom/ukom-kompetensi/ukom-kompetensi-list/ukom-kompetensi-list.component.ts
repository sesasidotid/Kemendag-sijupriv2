import { Component } from '@angular/core'
import { TabService } from '../../../../modules/base/services/tab.service'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { UkomKompetensiAddComponent } from '../ukom-kompetensi-add/ukom-kompetensi-add.component'
import { CommonModule } from '@angular/common'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
@Component({
  selector: 'app-ukom-kompetensi-list',
  standalone: true,
  imports: [
    PagableComponent,
    UkomKompetensiAddComponent,
    CommonModule,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-kompetensi-list.component.html',
  styleUrl: './ukom-kompetensi-list.component.scss'
})
export class UkomKompetensiListComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  pagable: Pagable
  jabatanList: Jabatan[] = []
  jenjangList: Jenjang[] = []
  refreshToggle: boolean = false

  isModalOpen$ = new BehaviorSubject<boolean>(false)

  editKompetensiForm: FormGroup
  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public tabService: TabService,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService
  ) {
    this.pagable = new PagableBuilder(`/api/v1/kompetensi/search`)
      .addPrimaryColumn(new PrimaryColumnBuilder('Kode', 'code').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jabatan', (data: any) => {
            const matchingJabatan = this.jabatanList.find(
              (jabatan: Jabatan) => jabatan.code === data.jabatanCode
            )
            return matchingJabatan ? matchingJabatan.name : null
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenjang', (data: any) => {
            const matchingJenjang = this.jenjangList.find(
              (jenjang: Jenjang) => jenjang.code === data.jenjangCode
            )
            return matchingJenjang ? matchingJenjang.name : null
          })
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('code')
          .withField('Kode', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name')
          .withField('Nama', 'text')
          .build()
      )
      //   .addActionColumn(
      //     new ActionColumnBuilder()
      //       .setAction((kompetensi: any) => {
      //         this.router.navigate([
      //           `/maintenance/kompetensi-list/${kompetensi.id}`
      //         ])
      //       }, 'info')
      //       .withIcon('detail')
      //       .build()
      //   )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            // this.router.navigate([
            //   `/ukom/ukom-room-list/detail-participant/${data.id}`
            // ])
            this.setDefaultFormValues(data)
            this.toggleModal()
          }, 'primary')
          .withIcon('update')
          .build()
      )
      .build()

    this.editKompetensiForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', Validators.required)
    })
  }

  setDefaultFormValues (data: any) {
    console.log('data', data)
    this.editKompetensiForm.patchValue({
      id: data.id || '',
      name: data.name || ''
    })
  }

  ngOnInit () {
    this.getJabatanList()
    this.getJenjangList()

    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Kompetensi',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Kompetensi',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  getJabatanList () {
    this.apiService.getData('/api/v1/jabatan').subscribe({
      next: (response: any) => {
        this.jabatanList = response.map(
          (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
        )
      }
    })
  }

  getJenjangList () {
    this.apiService.getData('/api/v1/jenjang/').subscribe({
      next: (response: any) => {
        this.jenjangList = response.map(
          (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
        )
      }
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
      id: this.editKompetensiForm.value.id,
      name: this.editKompetensiForm.value.name
    }

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService.putData('/api/v1/kompetensi', payload).subscribe({
          next: response => {
            this.handlerService.handleAlert(
              'Success',
              'Berhasil menambahkan data'
            )
            this.handleRefreshToggle()
            this.toggleModal()
          },
          error: error => this.handlerService.handleException(error)
        })
      }
    })
  }
}
