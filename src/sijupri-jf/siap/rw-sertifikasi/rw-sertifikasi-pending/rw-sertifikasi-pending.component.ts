import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { RWSertifikasi } from '../../../../modules/siap/models/rw-sertifikasi.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KategoriSertifikasi } from '../../../../modules/maintenance/models/kategori-sertifikasi.model';
import { Task } from '../../../../modules/workflow/models/task.model';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';

@Component({
  selector: 'app-rw-sertifikasi-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-sertifikasi-pending.component.html',
  styleUrl: './rw-sertifikasi-pending.component.scss'
})
export class RwSertifikasiPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwSertifikasi: RWSertifikasi = new RWSertifikasi();
  kategoriSertifikasiList: KategoriSertifikasi[] = [];
  pendingTask: PendingTask;
  kategori: number = 0;

  inputs: FIleHandler = {
    files: {
      skPengangkatan: { label: "SK Pengankatan", source: this.rwSertifikasi.skPengangkatanUrl },
      ktpPpns: { label: "KTP PPNS", source: this.rwSertifikasi.ktpPpnsUrl, visible: () => this.kategori == 2 }
    },
    listen: (key: string, source: string, base64Data: string) => {
      if (key == "skPengangkatan")
        this.rwSertifikasi.fileSkPengangkatan = base64Data;
      else if (key == "ktpPpns")
        this.rwSertifikasi.fileKtpPpns = base64Data;
    }
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_sertifikasi/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Sertifikasi", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tipe Reques", 'taskType').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWSertifikasi(this.pendingTask.id)
          this.getKategoriSertifikasiList()
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Sertifikasi", "text").build())
      .build();
  }

  getKategoriSertifikasiList() {
    this.apiService.getData(`/api/v1/kategori_sertifikasi`).subscribe({
      next: (response) => {
        this.kategoriSertifikasiList = response.map((kategoriSertifikasi: { [key: string]: any; }) => new KategoriSertifikasi(kategoriSertifikasi))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  setKategori() {
    this.kategoriSertifikasiList.forEach(kategoriSertifikasi => {
      if (kategoriSertifikasi.id == this.rwSertifikasi.kategoriSertifikasiId) {
        this.kategori = kategoriSertifikasi.value;
      }
    });
  }

  getPendingRWSertifikasi(id: string) {
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwSertifikasi = new RWSertifikasi(pendingTask.objectTask.object);
        this.kategori = this.rwSertifikasi.kategoriSertifikasiValue;
        this.isDetailOpen = true;
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    });
  }

  back() {
    this.kategoriSertifikasiList.length = 0;
    this.pendingTask = null;
    this.isDetailOpen = false;
    this.rwSertifikasi = new RWSertifikasi();
  }

  submit() {
    if (this.kategori != 2) {
      this.rwSertifikasi.dateEnd = undefined;
      this.rwSertifikasi.dateStart = undefined;
      this.rwSertifikasi.wilayahKerja = undefined;
      this.rwSertifikasi.uuKawalan = undefined;
      this.rwSertifikasi.ktpPpns = undefined;
      this.rwSertifikasi.ktpPpnsUrl = undefined;
      this.rwSertifikasi.fileKtpPpns = undefined;
    }

    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        const task = new Task();
        task.id = this.pendingTask.id;
        task.taskAction = "approve";
        task.object = this.rwSertifikasi;

        this.apiService.postData(`/api/v1/rw_sertifikasi/task/submit`, task).subscribe({
          next: () => {},
          error: (error) => {
            console.log("error", error);
            this.alertService.showToast("Error", "gagal mengirim data");
          }
        })
      }
    })
  }
}
