import { Component } from '@angular/core'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { ActivatedRoute, Router } from '@angular/router'
import { JfService } from '../../../../modules/siap/services/jf.service'
import { JF } from '../../../../modules/siap/models/jf.model'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
@Component({
  selector: 'app-ukom-detail',
  standalone: true,
  imports: [PagableComponent, CommonModule],
  templateUrl: './ukom-detail.component.html',
  styleUrl: './ukom-detail.component.scss'
})
export class UkomDetailComponent {
  pagable: Pagable
  jf: JF = new JF()
  jfLoading$ = new BehaviorSubject<boolean>(false)

  id: string
  constructor (
    private activatedRoute: ActivatedRoute,
    private jfService: JfService,
    private router: Router
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })

    this.pagable = new PagableBuilder(`/api/v1/participant_ukom/all/${this.id}`)
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenis Ukom', (data: any) =>
            data.jenisUkom === 'KENAIKAN_JENJANG'
              ? 'Kenaikan Jenjang'
              : data.jenisUkom === 'PERPINDAHAN_JABATAN'
              ? 'Perpindahan Jabatan'
              : data.jenisUkom
          )
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tanggal', 'lastUpdated').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            this.router.navigate([`/ukom/ukom-list/detail/${ukom.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .build()

    this.getJF()
  }

  getJF () {
    this.jfLoading$.next(true)
    this.jfService.findByNip(this.id).subscribe({
      next: (jf: JF) => {
        this.jf = jf
        this.jfLoading$.next(false)
      }
    })
  }
}
