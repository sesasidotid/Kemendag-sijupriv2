import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { RWKompetensi } from '../../../../modules/siap/models/rw-kompetensi.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { CommonModule } from '@angular/common';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';

@Component({
  selector: 'app-rw-kompetensi-list',
  standalone: true,
  imports: [CommonModule, FileHandlerComponent, PagableComponent],
  templateUrl: './rw-kompetensi-list.component.html',
  styleUrl: './rw-kompetensi-list.component.scss'
})
export class RwKompetensiListComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwKompetensi: RWKompetensi = new RWKompetensi();

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_kompetensi/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Mulai", 'dateStart').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Selesai", 'dateEnd').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Sertifikat", 'tglSertifikat').build())
      .addActionColumn(new ActionColumnBuilder().setAction((rwKompetensi: any) => {
        this.getRWKompetensi(rwKompetensi.id)
        this.isDetailOpen = true;
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("tglSertifikat").withField("Tgl Sertifikat", "text").build())
      .build();
  }

  getRWKompetensi(id: string) {
    this.apiService.getData(`/api/v1/rw_kompetensi/${id}`).subscribe({
      next: (response) => {
        this.rwKompetensi = new RWKompetensi(response);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  back() {
    this.isDetailOpen = false;
    this.rwKompetensi = new RWKompetensi();
  }
}
