import { Component } from '@angular/core'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'

@Component({
  selector: 'app-ukom-class-detail',
  standalone: true,
  imports: [PagableComponent, CommonModule],
  templateUrl: './ukom-class-detail.component.html',
  styleUrl: './ukom-class-detail.component.scss'
})
export class UkomClassDetailComponent {
  //change when api is ready
  detailKelas: any = {}
  listPeserta: any[] = []

  detailKelasLoading$ = new BehaviorSubject<boolean>(false)

  pagable: Pagable
  data: any[] = []

  constructor (
    private apiService: ApiService,
    private alertService: AlertService
  ) {
    this.pagable = new PagableBuilder(
      'http://localhost:4200/assets/mockdata/ukom-list-mockdata.json'
    )

      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'NIP').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'Email').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'Nama').build())
      .build()
  }

  ngOnInit () {
    this.getDetailKelas()
  }

  getDetailKelas () {
    fetch('http://localhost:4200/assets/mockdata/ukom-class-list-mockdata.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          this.detailKelas = data[0]
          console.log('detailKelas:', this.detailKelas)
        } else {
          this.alertService.showToast('Warning', 'No data found!')
        }
      })
      .catch(error => {
        console.log('Error fetching data:', error)
        this.alertService.showToast('Error', 'Failed to fetch data!')
      })
  }
}
