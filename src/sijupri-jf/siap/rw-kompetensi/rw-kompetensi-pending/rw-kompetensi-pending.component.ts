import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { RWKompetensi } from '../../../../modules/siap/models/rw-kompetensi.model';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { Task } from '../../../../modules/workflow/models/task.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KategoriPengembangan } from '../../../../modules/maintenance/models/kategori-pengembangan.model';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-rw-kompetensi-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-kompetensi-pending.component.html',
  styleUrl: './rw-kompetensi-pending.component.scss'
})
export class RwKompetensiPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwKompetensi: RWKompetensi = new RWKompetensi();
  kategoriPengembanganList: KategoriPengembangan[] = []
  pendingTask: PendingTask;

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "Sertifikat", source: this.rwKompetensi.sertifikatUrl },
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwKompetensi.fileSertifikat = base64Data;
    }
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_kompetensi/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Kompetensi", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tipe Reques", 'taskType').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWKompetensi(this.pendingTask.id)
          this.getKategoriPengembanganList()
          this.isDetailOpen = true;
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Kompetensi", "text").build())
      .build();
  }

  getKategoriPengembanganList() {
    this.apiService.getData(`/api/v1/kategori_pengembangan`).subscribe({
      next: (response) => {
        this.kategoriPengembanganList = response.map((kategoriPengembangan: { [key: string]: any; }) => new KategoriPengembangan(kategoriPengembangan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  getPendingRWKompetensi(id: string) {
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwKompetensi = new RWKompetensi(pendingTask.objectTask.object);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    });
  }

  back() {
    this.kategoriPengembanganList.length = 0;
    this.pendingTask = null;
    this.isDetailOpen = false;
    this.rwKompetensi = new RWKompetensi();
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        const task = new Task();
        task.id = this.pendingTask.id;
        task.taskAction = "approve";
        task.object = this.rwKompetensi;

        this.apiService.postData(`/api/v1/rw_kompetensi/task/submit`, task).subscribe({
          next: () => this.isDetailOpen = false,
          error: (error) => {
            console.log("error", error);
            this.alertService.showToast("Error", "gagal mengirim data");
          }
        })
      }
    })
  }
}
