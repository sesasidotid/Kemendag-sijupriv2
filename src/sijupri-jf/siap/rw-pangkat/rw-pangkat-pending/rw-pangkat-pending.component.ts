import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { Task } from '../../../../modules/workflow/models/task.model';
import { RWPangkat } from '../../../../modules/siap/models/rw-pangkat.model';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-rw-pangkat-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-pangkat-pending.component.html',
  styleUrl: './rw-pangkat-pending.component.scss'
})
export class RwPangkatPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwPangkat: RWPangkat = new RWPangkat();
  pangkatList: Pangkat[] = []
  pendingTask: PendingTask;
  rwPangkatForm!: FormGroup;

  pangkatListLoading$ = new BehaviorSubject<boolean>(false);
  rwPangkatLoading$ = new BehaviorSubject<boolean>(false);
  submitLoading$ = new BehaviorSubject<boolean>(false);

  inputs: FIleHandler;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_pangkat/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Pangkat", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWPangkat(this.pendingTask.id)
          this.getPangkatList()
          this.isDetailOpen = true;
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("update").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Pangkat", "text").build())
      .build();

    this.rwPangkatForm = new FormGroup({
      pangkatCode: new FormControl('', [Validators.required]),
      tmt: new FormControl('', [Validators.required]),
      fileSkPangkat: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    })
  }
  fileLoadHandler() {
    this.inputs = {
      files: {
        docEvaluas: { label: "Upload Dokumen SK Pangkat", fileName: this.rwPangkat.skPangkat, source: this.rwPangkat.skPangkatUrl, required: true },
      },
      listen: (key: string, source: string, base64Data: string) => {
        this.rwPangkatForm.patchValue({
          fileSkPangkat: base64Data
        });
      }
    }
  }

  getPangkatList() {
    this.pangkatListLoading$.next(true);
    this.apiService.getData(`/api/v1/pangkat`).subscribe({
      next: (response) => {
        this.pangkatList = response.map((pangkat: { [key: string]: any; }) => new Pangkat(pangkat))
        this.pangkatListLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data pangkat!");
        this.pangkatListLoading$.next(false);
      }
    })
  }

  getPendingRWPangkat(id: string) {
    this.rwPangkatLoading$.next(true);
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwPangkat = new RWPangkat(pendingTask.objectTask.object);
        this.rwPangkatForm.patchValue({
          pangkatCode: this.rwPangkat.pangkatCode,
          tmt: this.rwPangkat.tmt
        })
        this.fileLoadHandler();
        this.rwPangkatLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.rwPangkatLoading$.next(false);
        this.alertService.showToast("Error", "Gagal mandapatkan data pangat!");
      }
    });
  }

  back() {
    this.pangkatList.length = 0;
    this.pendingTask = null;
    this.isDetailOpen = false;
    this.rwPangkat = new RWPangkat();
  }

  submit() {
    if (this.rwPangkatForm.valid) {
      this.rwPangkat.pangkatCode = this.rwPangkatForm.value.pangkatCode;
      this.rwPangkat.tmt = this.rwPangkatForm.value.tmt;
      this.rwPangkat.fileSkPangkat = this.rwPangkatForm.value.fileSkPangkat;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          this.submitLoading$.next(true);

          const task = new Task();
          task.id = this.pendingTask.id;
          task.taskAction = "approve";
          task.object = this.rwPangkat;

          this.apiService.postData(`/api/v1/rw_pangkat/task/submit`, task).subscribe({
            next: () => {
              this.alertService.showToast("Success", "Berhasil memperbarui riwayat pangkat.");
              this.submitLoading$.next(false);
              this.back();
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal memperbarui riwayat pangkat!");
            }
          })
        }
      })
    }
  }
}
