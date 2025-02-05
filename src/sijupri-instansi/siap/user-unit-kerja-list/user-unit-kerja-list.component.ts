import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
import { UserUnitKerja } from './../../../modules/siap/models/user-unit-kerja.model'
import { Component } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { TabService } from '../../../modules/base/services/tab.service'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { UserUnitKerjaUpdateComponent } from '../user-unit-kerja-update/user-unit-kerja-update.component'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
@Component({
  selector: 'app-user-unit-kerja-list',
  standalone: true,
  imports: [
    RouterLink,
    PagableComponent,
    UserUnitKerjaUpdateComponent,
    ModalComponent,
    CommonModule
  ],
  templateUrl: './user-unit-kerja-list.component.html',
  styleUrl: './user-unit-kerja-list.component.scss'
})
export class UserUnitKerjaListComponent {
  pagable: Pagable

  isModalOpen$ = new BehaviorSubject<boolean>(false)
  SelecterUserUnitKerja: UserUnitKerja = new UserUnitKerja()

  constructor (
    private router: Router,
    private tabService: TabService,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.pagable = new PagableBuilder('/api/v1/user_unit_kerja/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'name', ['user']).build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Email', 'email', ['user']).build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((unitKerja: any) => {
            this.router.navigate([`siap/user-unit-kerja/${unitKerja.nip}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            this.toggleModal()
            this.SelecterUserUnitKerja = data
          }, 'primary')
          .withIcon('update')
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            this.handleDelete(data.nip)
          }, 'danger')
          .withIcon('danger')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('nip')
          .withField('NIP', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name', ['user'])
          .withField('Nama', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('email', ['user'])
          .withField('Email', 'text')
          .build()
      )
      //   .addFilter(
      //     new PageFilterBuilder('equal')
      //       .setProperty('id', ['instansi'])
      //       .withDefaultValue(LoginContext.getInstansiId())
      //       .build()
      //   )
      .build()
  }
  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar User Unit Kerja',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate([`/siap/user-unit-kerja`])
      })
      .addTab({
        label: 'Tambah User Unit Kerja',
        icon: 'mdi-plus-circle',
        onClick: () => this.router.navigate([`/siap/user-unit-kerja/add`])
      })
  }

  handleDelete (userNip: string) {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        this.apiService
          .deleteData(`/api/v1/user_unit_kerja/${userNip}`)
          .subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Berhasil menghapus user unit kerja.'
              )
              setTimeout(() => {
                window.location.reload()
              }, 100)
            },
            error: error => {
              console.log('error', error)
              this.handlerService.handleAlert(
                'Error',
                'Gagal menghapus data user unit kerja'
              )
            }
          })
      }
    })
  }
}
