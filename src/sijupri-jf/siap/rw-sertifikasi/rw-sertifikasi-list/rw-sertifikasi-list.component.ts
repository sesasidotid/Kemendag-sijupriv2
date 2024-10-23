import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { RWSertifikasi } from '../../../../modules/siap/models/rw-sertifikasi.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { CommonModule } from '@angular/common';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';

@Component({
  selector: 'app-rw-sertifikasi-list',
  standalone: true,
  imports: [PagableComponent, CommonModule, FileHandlerComponent],
  templateUrl: './rw-sertifikasi-list.component.html',
  styleUrl: './rw-sertifikasi-list.component.scss'
})
export class RwSertifikasiListComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwSertifikasi: RWSertifikasi = new RWSertifikasi();

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_sertifikasi/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("No. SK", 'noSk').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tgl SK", 'tglSk').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Wilayah Kerja", 'wilayahKerja').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Mulai", 'dateStart').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Selesai", 'dateEnd').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("UU Kawalan", 'uuKawalan').build())
      .addActionColumn(new ActionColumnBuilder().setAction((rwSertifikasi: any) => {
        this.getRWSertifikasi(rwSertifikasi.id)
        this.isDetailOpen = true;
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("noSk").withField("No. SK", "text").build())
      .addFilter(new PageFilterBuilder("equal").setProperty("tglSk").withField("Tgl SK", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("wilayahKerja").withField("Wilayah Kerja", "text").build())
      .build();
  }

  getRWSertifikasi(id: string) {
    this.apiService.getData(`/api/v1/rw_sertifikasi/${id}`).subscribe({
      next: (response) => {
        this.rwSertifikasi = new RWSertifikasi(response);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  back() {
    this.isDetailOpen = false;
    this.rwSertifikasi = new RWSertifikasi();
  }

  visibility() {
    return () => this.rwSertifikasi.kategoriSertifikasiValue == 2
  }
}
