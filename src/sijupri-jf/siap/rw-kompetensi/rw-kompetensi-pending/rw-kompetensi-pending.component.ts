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
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KategoriPengembangan } from '../../../../modules/maintenance/models/kategori-pengembangan.model';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-rw-kompetensi-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-kompetensi-pending.component.html',
  styleUrl: './rw-kompetensi-pending.component.scss'
})
export class RwKompetensiPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwKompetensi: RWKompetensi = new RWKompetensi();
  kategoriPengembanganList: KategoriPengembangan[] = []
  pendingTask: PendingTask;

  rwKompetensiForm!: FormGroup;

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "Upload Dokumen Sertifikat", source: this.rwKompetensi.sertifikatUrl, required: true},
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
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWKompetensi(this.pendingTask.id)
          this.getKategoriPengembanganList()
          this.isDetailOpen = true;
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("update").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Kompetensi", "text").build())
      .build();

      this.rwKompetensiForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        kategoriPengembanganId: new FormControl('', [Validators.required]),
        dateStart: new FormControl('', [Validators.required]),
        dateEnd: new FormControl('', [Validators.required]),
        tglSertifikat: new FormControl('', [Validators.required]),
      })
  }

  getKategoriPengembanganList() {
    this.apiService.getData(`/api/v1/kategori_pengembangan`).subscribe({
      next: (response) => {
        this.kategoriPengembanganList = response.map((kategoriPengembangan: { [key: string]: any; }) => new KategoriPengembangan(kategoriPengembangan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data kategori pengembangan!");
      }
    })
  }

  getPendingRWKompetensi(id: string) {
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwKompetensi = new RWKompetensi(pendingTask.objectTask.object);
        this.rwKompetensiForm.patchValue({
          name: this.rwKompetensi.name,
          kategoriPengembanganId: this.rwKompetensi.kategoriPengembanganId,
          dateStart: this.rwKompetensi.dateStart,
          dateEnd: this.rwKompetensi.dateEnd,
          tglSertifikat: this.rwKompetensi.tglSertifikat,
        });
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data riwayat Kompetensi!");
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
    if (this.rwKompetensiForm.valid) {
      this.rwKompetensi.name = this.rwKompetensiForm.value.name;
      this.rwKompetensi.kategoriPengembanganId = this.rwKompetensiForm.value.kategoriPengembanganId;
      this.rwKompetensi.dateStart = this.rwKompetensiForm.value.dateStart;
      this.rwKompetensi.dateEnd = this.rwKompetensiForm.value.dateEnd;
      this.rwKompetensi.tglSertifikat = this.rwKompetensiForm.value.tglSertifikat;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
  
          const task = new Task();
          task.id = this.pendingTask.id;
          task.taskAction = "approve";
          task.object = this.rwKompetensi;
  
          this.apiService.postData(`/api/v1/rw_kompetensi/task/submit`, task).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat kompetensi.");
              this.back();
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "gagal mengirim data");
            }
          })
        }
      })
    }
  }
}
