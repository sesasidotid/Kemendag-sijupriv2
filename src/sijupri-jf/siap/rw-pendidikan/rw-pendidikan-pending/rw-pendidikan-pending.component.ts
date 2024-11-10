import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { RWPendidikan } from '../../../../modules/siap/models/rw-perndidikan.model';
import { Pendidikan } from '../../../../modules/maintenance/models/pendidikan.model';
import { Task } from '../../../../modules/workflow/models/task.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { PageColumn } from '../../../../modules/base/commons/pagable/page-column';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-rw-pendidikan-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-pendidikan-pending.component.html',
  styleUrl: './rw-pendidikan-pending.component.scss'
})
export class RwPendidikanPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwPendidikan: RWPendidikan = new RWPendidikan();
  pendidikanList: Pendidikan[] = []
  pendingTask: PendingTask;

  rwPendidikanForm!: FormGroup;

  rwPendidikanLoading$ = new BehaviorSubject<boolean>(false);

  inputs: FIleHandler;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_pendidikan/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Pendidikan", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Proses", 'flowName').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWPendidikan(this.pendingTask.id)
          this.getPendidikanList()
          this.isDetailOpen = true;
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("update").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Pendidikan", "text").build())
      .build();

      this.rwPendidikanForm = new FormGroup({
        institusiPendidikan: new FormControl('', [Validators.required]),
        pendidikanCode: new FormControl('', [Validators.required]),
        jurusan: new FormControl('', [Validators.required]),
        tanggalIjazah: new FormControl('', [Validators.required]),
        fileIjazah: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
      })
  }

  fileLoadHandler() {
    this.inputs = {
      files: {
        ijazah: { label: "Upload Dokumen Ijazah", fileName: this.rwPendidikan.ijazah , source: this.rwPendidikan.ijazahUrl, required: true}
      },
      listen: (key: string, source: string, base64Data: string) => {
        this.rwPendidikanForm.patchValue({
          fileIjazah: base64Data
        })
      },
    }
  }

  getPendidikanList() {
    this.apiService.getData(`/api/v1/pendidikan`).subscribe({
      next: (response) => {
        this.pendidikanList = response.map((pendidikan: { [key: string]: any; }) => new Pendidikan(pendidikan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data pendidikan!");
      }
    })
  }

  getPendingRWPendidikan(id: string) {
    this.rwPendidikanLoading$.next(true);
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwPendidikan = new RWPendidikan(pendingTask.objectTask.object);
        this.rwPendidikanForm.patchValue({
          institusiPendidikan: this.rwPendidikan.institusiPendidikan,
          pendidikanCode: this.rwPendidikan.pendidikanCode,
          jurusan: this.rwPendidikan.jurusan,
          tanggalIjazah: this.rwPendidikan.tanggalIjazah,
        })
        this.fileLoadHandler();
        this.rwPendidikanLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.rwPendidikanLoading$.next(false);
        this.alertService.showToast("Error", "Gagal mendapatkan data pendidikan!");
      }
    });
  }

  back() {
    this.pendidikanList.length = 0;
    this.pendingTask = null;
    this.isDetailOpen = false;
    this.rwPendidikan = new RWPendidikan();
  }

  submit() {
    if (this.rwPendidikanForm.valid) {
      this.rwPendidikan.pendidikanCode = this.rwPendidikanForm.value.pendidikanCode;
      this.rwPendidikan.institusiPendidikan = this.rwPendidikanForm.value.institusiPendidikan;
      this.rwPendidikan.jurusan = this.rwPendidikanForm.value.jurusan;
      this.rwPendidikan.tanggalIjazah = this.rwPendidikanForm.value.tanggalIjazah;
      this.rwPendidikan.fileIjazah = this.rwPendidikanForm.value.fileIjazah;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
  
          const task = new Task();
          task.id = this.pendingTask.id;
          task.taskAction = "approve";
          task.object = this.rwPendidikan;
  
          this.apiService.postData(`/api/v1/rw_pendidikan/task/submit`, task).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil memperbarui pengajuan riwayat pendidikan.");
              this.back();
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal memperbarui riwayat pendidikan!");
            }
          })
        }
      });
    }
  }
}
