import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Instrument } from '../../../modules/akp/models/instrument.model'
import { InstrumentService } from '../../../modules/akp/services/instrument.service'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { TabService } from '../../../modules/base/services/tab.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { KknAddComponent } from '../kkn-add/kkn-add.component'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'

@Component({
  selector: 'app-kkn',
  standalone: true,
  imports: [PagableComponent, CommonModule, KknAddComponent],
  templateUrl: './kkn.component.html',
  styleUrl: './kkn.component.scss'
})
export class KknComponent {
  instrumentList: Instrument[]
  pagable: Pagable

  tab$ = new BehaviorSubject<number | null>(0)

  constructor (
    private tabService: TabService,
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.pagable = new PagableBuilder('/api/v1/kategori_instrument/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Instrumen', 'instrument|name')
          //   .withSortable(false)
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((kkn: any) => {
            this.router.navigate([`/akp/kkn/${kkn.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((kkn: any) => {
            this.onDelete(kkn.id)
          }, 'danger')
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
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar KKN',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah KKN',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })

    this.getInstrumenList()
  }

  handleTabChange (tab?: number) {
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }

  onDelete (kknId: string) {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService
          .deleteData(`/api/v1/kategori_instrument/${kknId}`)
          .subscribe({
            next: () => {
              this.alertService.showToast(
                'Success',
                'Kategori instrument berhasil dihapus!'
              )
              this.tab$.next(null)
              setTimeout(() => {
                this.tab$.next(0)
              }, 100)
            },
            error: error => {
              console.error('Error fetching data', error)
              this.alertService.showToast(
                'Error',
                'Gagal menghapus kategori instrument!'
              )
            }
          })
      }
    })
  }

  getInstrumenList () {
    this.apiService.getData('/api/v1/instrument').subscribe({
      next: response => {
        this.instrumentList = response.map(
          (instrument: { [key: string]: any }) => new Instrument(instrument)
        )

        this.pagable.filterLIst.push(
          new PageFilterBuilder('equal')
            .setProperty('instrumentId')
            .withField('Instrumen', 'select')
            .setOptionListFromObjectList(this.instrumentList, 'name', 'id')
            .build()
        )
      },
      error: error => {
        console.error('Error fetching data', error)
        this.alertService.showToast('Error', 'Terjadi Masalah')
        throw error
      }
    })
  }
}
