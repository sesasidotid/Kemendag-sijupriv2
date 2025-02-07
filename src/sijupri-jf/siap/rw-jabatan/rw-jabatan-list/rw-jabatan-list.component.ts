import { Component, Input } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RWJabatan } from '../../../../modules/siap/models/rw-jabatan.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-rw-jabatan-list',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-jabatan-list.component.html',
  styleUrl: './rw-jabatan-list.component.scss'
})
export class RwJabatanListComponent {
  @Input() nip?: string = ''
  apiUrl: string = '/api/v1/rw_jabatan/search'

  pagable: Pagable
  isDetailOpen: boolean = false
  rwJabatan: RWJabatan = new RWJabatan()

  loading$ = new BehaviorSubject<boolean>(true)

  constructor (
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  ngOnInit () {
    this.apiUrl =
      this.nip === ''
        ? '/api/v1/rw_jabatan/search'
        : `/api/v1/rw_jabatan/search?eq_nip=${this.nip}`

    this.pagable = new PagableBuilder(this.apiUrl)
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jabatan', 'jabatan|name').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jenjang', 'jenjang|name').build()
      )
      .addPrimaryColumn(new PrimaryColumnBuilder('TMT', 'tmt').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((rwJabatan: any) => {
            this.getRWJabatan(rwJabatan.id)
            this.isDetailOpen = true
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('dateStart')
          .withField('Jabatan', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('dateEnd')
          .withField('Jenjang', 'text')
          .build()
      )
      .build()
  }

  getRWJabatan (id: string) {
    this.loading$.next(true)
    this.apiService.getData(`/api/v1/rw_jabatan/${id}`).subscribe({
      next: response => {
        this.rwJabatan = new RWJabatan(response)
        this.loading$.next(false)
      },
      error: error => {
        console.log('error', error)
        this.alertService.showToast('Error', 'Gagal mendapatkan data riwayat')
        this.loading$.next(false)
      }
    })
  }

  back () {
    this.isDetailOpen = false
    this.rwJabatan = new RWJabatan()
  }
}
