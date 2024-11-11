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
import { BehaviorSubject } from 'rxjs';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';

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

  kategoriPengembanganLoading$ = new BehaviorSubject<boolean>(false);
  rwKompetensiLoading$ = new BehaviorSubject<boolean>(false);
  submitLoading$ = new BehaviorSubject<boolean>(false);

  rwKompetensiForm!: FormGroup;

  inputs: FIleHandler;

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
          this.isDetailOpen = true;
          this.getPendingRWKompetensi(this.pendingTask.id)
          this.getKategoriPengembanganList()
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
        fileSertifikat: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
      })
  }

  fileLoadHandler() {
    this.inputs = {
      files: {
        docEvaluas: { label: "Upload Dokumen Sertifikat", fileName: this.rwKompetensi.sertifikat, source: this.rwKompetensi.sertifikatUrl, required: true},
      },
      listen: (key: string, source: string, base64Data: string) => {
        this.rwKompetensiForm.patchValue({
          fileSertifikat: base64Data
        });
      }
    }
  }

  getKategoriPengembanganList() {
    this.kategoriPengembanganLoading$.next(true);
    this.apiService.getData(`/api/v1/kategori_pengembangan`).subscribe({
      next: (response) => {
        this.kategoriPengembanganList = response.map((kategoriPengembangan: { [key: string]: any; }) => new KategoriPengembangan(kategoriPengembangan))
        this.kategoriPengembanganLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data kategori pengembangan!");
        this.kategoriPengembanganLoading$.next(false);
      }
    })
  }

  getPendingRWKompetensi(id: string) {
    this.rwKompetensiLoading$.next(true);
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
        this.fileLoadHandler();
        this.rwKompetensiLoading$.next(false);
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
      this.rwKompetensi.fileSertifikat = this.rwKompetensiForm.value.fileSertifikat;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          this.submitLoading$.next(true);
  
          const task = new Task();
          task.id = this.pendingTask.id;
          task.taskAction = "approve";
          task.object = this.rwKompetensi;
  
          this.apiService.postData(`/api/v1/rw_kompetensi/task/submit`, task).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil mengubah riwayat kompetensi.");
              this.submitLoading$.next(false);
              this.back();
            },
            error: (error) => {
              console.log("error", error);
              this.submitLoading$.next(false);
              this.alertService.showToast("Error", "Gagal mengubah riwayat kompetensi.");
            }
          })
        }
      })
    }
  }
}
