import { Component, Input } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { RWKinerja } from '../../../../modules/siap/models/rw-kinerja.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-rw-kinerja-list',
  standalone: true,
  imports: [PagableComponent, CommonModule, FileHandlerComponent],
  templateUrl: './rw-kinerja-list.component.html',
  styleUrl: './rw-kinerja-list.component.scss'
})
export class RwKinerjaListComponent {
  @Input() nip?: string = ''
  apiUrl: string = '/api/v1/rw_kinerja/search'

  pagable: Pagable
  isDetailOpen: boolean = false
  rwKinerja: RWKinerja = new RWKinerja()

  loading$ = new BehaviorSubject<boolean>(true)

  constructor (
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  ngOnInit () {
    this.apiUrl =
      this.nip === ''
        ? '/api/v1/rw_kinerja/search'
        : `/api/v1/rw_kinerja/search?eq_nip=${this.nip}`

    this.pagable = new PagableBuilder(this.apiUrl)
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tahunan/Bulanan', 'type').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tgl Mulai', 'dateStart').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tgl Selesai', 'dateEnd').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Angka Kredit', 'angkaKredit').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((rwKinerja: any) => {
            this.getRWKinerja(rwKinerja.id)
            this.isDetailOpen = true
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('type')
          .withField('Tahunan/Bulanan', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('dateStart')
          .withField('Tgl Mulai', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('dateEnd')
          .withField('Tgl Selesai', 'text')
          .build()
      )
      .build()
  }

  getRWKinerja (id: string) {
    this.loading$.next(true)
    this.apiService.getData(`/api/v1/rw_kinerja/${id}`).subscribe({
      next: response => {
        this.rwKinerja = new RWKinerja(response)
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
    this.rwKinerja = new RWKinerja()
  }
}
