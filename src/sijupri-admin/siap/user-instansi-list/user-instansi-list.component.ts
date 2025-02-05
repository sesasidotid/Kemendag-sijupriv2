import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Router, RouterLink } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { TabService } from '../../../modules/base/services/tab.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { BehaviorSubject } from 'rxjs'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { UserInstansi } from '../../../modules/siap/models/user-instansi.model'
import { UserInstansiUpdateComponent } from '../user-instansi-update/user-instansi-update.component'
import { CommonModule } from '@angular/common'
@Component({
  selector: 'app-user-instansi-list',
  standalone: true,
  imports: [
    RouterLink,
    ModalComponent,
    PagableComponent,
    UserInstansiUpdateComponent,
    CommonModule
  ],
  templateUrl: './user-instansi-list.component.html',
  styleUrl: './user-instansi-list.component.scss'
})
export class UserInstansiListComponent {
  pagable: Pagable

  isModalOpen$ = new BehaviorSubject<boolean>(false)
  selectedUserInstansi: UserInstansi = new UserInstansi()
  constructor (
    private tabService: TabService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.pagable = new PagableBuilder('/api/v1/user_instansi/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'name', ['user']).build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Email', 'email', ['user']).build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            this.router.navigate([`/siap/user-instansi/${data.nip}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            this.toggleModal()
            this.selectedUserInstansi = data
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
      .build()
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar User Instansi',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate(['/siap/user-instansi'])
      })
      .addTab({
        label: 'Tambah User Instansi',
        icon: 'mdi-plus-circle',
        onClick: () => this.router.navigate(['/siap/user-instansi/add'])
      })
  }

  handleDelete (userNip: string) {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        this.apiService
          .deleteData(`/api/v1/user_instansi/${userNip}`)
          .subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Berhasil menghapus user instansi.'
              )
              setTimeout(() => {
                window.location.reload()
              }, 100)
            },
            error: error => {
              console.log('error', error)
              this.handlerService.handleAlert(
                'Error',
                'Gagal menghapus data user instansi'
              )
            }
          })
      }
    })
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }
}
