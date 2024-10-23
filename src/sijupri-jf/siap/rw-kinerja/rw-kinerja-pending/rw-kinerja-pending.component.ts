import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RWKinerja } from '../../../../modules/siap/models/rw-kinerja.model';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { Task } from '../../../../modules/workflow/models/task.model';
import { RatingKinerja } from '../../../../modules/maintenance/models/rating-kinerja.model';
import { PredikatKinerja } from '../../../../modules/maintenance/models/predikat-kinerja.model';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-rw-kinerja-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-kinerja-pending.component.html',
  styleUrl: './rw-kinerja-pending.component.scss'
})
export class RwKinerjaPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwKinerja: RWKinerja = new RWKinerja();
  ratingKinerjaList: RatingKinerja[] = [];
  predikatKinerjaList: PredikatKinerja[] = [];
  pendingTask: PendingTask;

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "Dokumen Evaluasi", source: this.rwKinerja.docEvaluasiUrl },
      docPredikat: { label: "Dokumen Predikat", source: this.rwKinerja.docPredikatUrl },
      docAkumulasiAk: { label: "Dokumen Akumulasi Angka Kredit", source: this.rwKinerja.docAkumulasiAkUrl },
      docPenetapanAk: { label: "Dokumen Penetapan Angka Kredit", source: this.rwKinerja.docPenetapanAkUrl },
    },
    listen: (key: string, source: string, base64Data: string) => {
      if (key == "docEvaluas")
        this.rwKinerja.fileDocEvaluasi = base64Data;
      else if (key == "docPredikat")
        this.rwKinerja.fileDocPredikat = base64Data;
      else if (key == "docAkumulasiAk")
        this.rwKinerja.fileDocAkumulasiAk = base64Data;
      else if (key == "docPenetapanAk")
        this.rwKinerja.fileDocPenetapanAk = base64Data;
    }
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_kinerja/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Kinerja", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tipe Reques", 'taskType').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWKinerja(this.pendingTask.id)
          this.getRatingKinerjaList()
          this.getPredikatKinerjaList()
          this.isDetailOpen = true;
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Kinerja", "text").build())
      .build();
  }

  getRatingKinerjaList() {
    this.apiService.getData(`/api/v1/rating_kinerja`).subscribe({
      next: (response) => {
        this.ratingKinerjaList = response.map((ratingKinerja: { [key: string]: any; }) => new RatingKinerja(ratingKinerja))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  getPredikatKinerjaList() {
    this.apiService.getData(`/api/v1/predikat_kinerja`).subscribe({
      next: (response) => {
        this.predikatKinerjaList = response.map((predikatKinerja: { [key: string]: any; }) => new PredikatKinerja(predikatKinerja))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  getPendingRWKinerja(id: string) {
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwKinerja = new RWKinerja(pendingTask.objectTask.object);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    });
  }

  back() {
    this.ratingKinerjaList.length = 0;
    this.predikatKinerjaList.length = 0;
    this.pendingTask = null;
    this.isDetailOpen = false;
    this.rwKinerja = new RWKinerja();
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        const task = new Task();
        task.id = this.pendingTask.id;
        task.taskAction = "approve";
        task.object = this.rwKinerja;

        this.apiService.postData(`/api/v1/rw_kinerja/task/submit`, task).subscribe({
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
