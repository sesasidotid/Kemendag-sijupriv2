import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { JF } from '../../../modules/siap/models/jf.model'
import { JfService } from '../../../modules/siap/services/jf.service'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-jf-akp-list',
  standalone: true,
  imports: [PagableComponent, CommonModule],
  templateUrl: './jf-akp-list.component.html',
  styleUrl: './jf-akp-list.component.scss'
})
export class JfAkpListComponent {
  pagable: Pagable
  jf: JF = new JF()
  jfNip: string

  jfLoading$ = new BehaviorSubject<boolean>(false)

  constructor (
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private jfService: JfService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.jfNip = params.get('id')
    })

    this.pagable = new PagableBuilder('/api/v1/akp/search')
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama Atasan', 'namaAtasan').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Email Atasan', 'emailAtasan').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Diajukan Pada', 'dateCreated').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Selesai Pada', 'lastUpdated').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((akp: any) => {
            this.router.navigate([`/akp/akp-list/detail/${akp.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('nip')
          .withDefaultValue(this.jfNip)
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('namaAtasan')
          .withField('Nama Atasan', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('emailAtasan')
          .withField('Email Atasan', 'text')
          .build()
      )
      .build()

    this.getJF()
  }

  getJF () {
    this.jfLoading$.next(true)
    this.jfService.findByNip(this.jfNip).subscribe({
      next: (jf: JF) => {
        this.jf = jf
        this.jfLoading$.next(false)
      }
    })
  }

  backToList () {
    this.router.navigate(['/akp/akp-list'])
  }
}
