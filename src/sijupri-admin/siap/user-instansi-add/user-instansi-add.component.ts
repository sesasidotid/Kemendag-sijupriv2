import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { InstansiType } from '../../../modules/maintenance/models/instansi-type.model'
import { UserInstansi } from '../../../modules/siap/models/user-instansi.model'
import { UserInstansiService } from '../../../modules/siap/services/user-instansi.service'
import { TabService } from '../../../modules/base/services/tab.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-user-instansi-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-instansi-add.component.html',
  styleUrl: './user-instansi-add.component.scss'
})
export class UserInstansiAddComponent {
  userInstansi: UserInstansi = new UserInstansi()
  instansiTypeList: InstansiType[]
  instansiList: Instansi[]
  provinsiList: Provinsi[]
  kabKotaList: KabKota[]
  operasional: string = null
  provinsiId: number = null
  kabupatenId: number = null
  kotaId: number = null

  constructor (
    private apiService: ApiService,
    private userInstansiService: UserInstansiService,
    private tabService: TabService,
    private handlerService: HandlerService
  ) {}

  ngOnInit () {
    this.tabService
      .addTab({
        label: 'Daftar User Instansi',
        icon: 'mdi-list-box',
        onClick: () => this.handlerService.handleNavigate('/siap/user-instansi')
      })
      .addTab({
        label: 'Tambah User Instansi',
        isActive: true,
        icon: 'mdi-plus-circle',
        onClick: () =>
          this.handlerService.handleNavigate('/siap/user-instansi/add')
      })

    this.getInstansiTypeList()
  }

  getInstansiTypeList () {
    this.apiService.getData(`/api/v1/instansi_type`).subscribe({
      next: response =>
        (this.instansiTypeList = response.map(
          (instansiType: { [key: string]: any }) =>
            new InstansiType(instansiType)
        )),
      error: error => this.handlerService.handleException(error)
    })
  }

  getInstansiList () {
    switch (this.operasional) {
      case 'IT1':
        this.apiService
          .getData(`/api/v1/instansi/type/${this.operasional}`)
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
      case 'IT2':
        this.apiService
          .getData(`/api/v1/instansi/type/${this.operasional}`)
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
      case 'IT3':
        this.apiService
          .getData(`/api/v1/instansi/provinsi/${this.provinsiId}`)
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
      case 'IT4':
        this.apiService
          .getData(`/api/v1/instansi/kab_kota/${this.kabupatenId}`)
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
      case 'IT5':
        this.apiService
          .getData(`/api/v1/instansi/kab_kota/${this.kotaId}`)
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
    }
  }

  getProvinsiList () {
    this.apiService.getData(`/api/v1/provinsi`).subscribe({
      next: response =>
        (this.provinsiList = response.map(
          (provinsi: { [key: string]: any }) => new Provinsi(provinsi)
        )),
      error: error => this.handlerService.handleException(error)
    })
  }

  getKabKotaList () {
    let type = this.operasional == 'IT4' ? 'KABUPATEN' : 'KOTA'

    this.apiService
      .getData(`/api/v1/kab_kota/type/${type}/${this.provinsiId}`)
      .subscribe({
        next: response =>
          (this.kabKotaList = response.map(
            (kabKota: { [key: string]: any }) => new KabKota(kabKota)
          )),
        error: error => this.handlerService.handleException(error)
      })
  }

  onOperasionalChange () {
    this.provinsiId = null
    this.kotaId = null
    this.kabupatenId = null
    this.userInstansi.instansiId = null
    if (['IT3', 'IT4', 'IT5'].includes(this.operasional)) {
      this.getProvinsiList()
    } else {
      this.getInstansiList()
    }
  }

  onProvinsiChange () {
    this.kotaId = null
    this.userInstansi.instansiId = null
    if (['IT4', 'IT5'].includes(this.operasional)) {
      this.getKabKotaList()
    } else {
      this.getInstansiList()
    }
  }

  onKabKotaChange () {
    this.userInstansi.instansiId = null
    this.getInstansiList()
  }

  submit () {
    this.userInstansiService.save(this.userInstansi).subscribe({
      next: () => {
        this.handlerService.handleAlert('Success', 'Berhasil')
        this.handlerService.handleNavigate('/siap/user-instansi')
      },
      error: error => this.handlerService.handleException(error)
    })
  }
}
