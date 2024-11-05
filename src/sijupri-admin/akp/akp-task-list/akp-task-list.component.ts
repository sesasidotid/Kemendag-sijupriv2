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
  templateUrl: './akp-task-list.component.html',
  styleUrl: './akp-task-list.component.scss'
})
export class AKPTaskComponent {
  instrumentList: Instrument[];
  pagable: Pagable;

  constructor(
    private tabService: TabService,
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.pagable = new PagableBuilder("/api/v1/akp/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("NIP", 'objectId').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama AKP", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Proses", 'flowName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((kkn: any) => {
        this.router.navigate([`/akp/akp-task/${kkn.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectId").withField("NIP", "text").build())
      .build();
  }
}
