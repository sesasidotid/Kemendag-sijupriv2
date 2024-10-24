import { Component } from '@angular/core';
import { PagableComponent } from "../../../modules/base/components/pagable/pagable.component";
import { Instrument } from '../../../modules/akp/models/instrument.model';
import { InstrumentService } from '../../../modules/akp/services/instrument.service';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { TabService } from '../../../modules/base/services/tab.service';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-kkn',
  standalone: true,
  imports: [PagableComponent, RouterLink],
  templateUrl: './kkn.component.html',
  styleUrl: './kkn.component.scss'
})
export class KknComponent {
  instrumentList: Instrument[];
  pagable: Pagable;

  constructor(
    private tabService: TabService,
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.pagable = new PagableBuilder("/api/v1/kategori_instrument/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Instrumen", 'instrument|name').build())
      .addActionColumn(new ActionColumnBuilder().setAction((kkn: any) => {
        this.router.navigate([LoginContext.getUserLoginRoute() + `/akp/kkn/${kkn.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name").withField("Nama", "text").build())
      .build();
  }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar KKN',
      isActive: true,
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() + `/akp/kkn`]),
    }).addTab({
      label: 'Tambah KKN',
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() + `/akp/kkn/add`]),
    });

    this.getInstrumenList();
  }

  getInstrumenList() {
    this.apiService.getData('/api/v1/instrument').subscribe({
      next: (response) => {
        this.instrumentList = response.map((instrument: { [key: string]: any; }) => new Instrument(instrument));

        this.pagable.filterLIst.push(new PageFilterBuilder("equal").setProperty("instrumentId").withField("Instrumen", "select")
          .setOptionListFromObjectList(this.instrumentList, "name", "id").build())
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', "Terjadi Masalah");
        throw error;
      }
    })
  }
}
