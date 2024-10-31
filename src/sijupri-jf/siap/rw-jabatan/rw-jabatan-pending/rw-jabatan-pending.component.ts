import { Component } from '@angular/core';
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../../modules/base/commons/pagable/pagable-builder';
import { Pagable } from '../../../../modules/base/commons/pagable/pagable';
import { RWJabatan } from '../../../../modules/siap/models/rw-jabatan.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { Task } from '../../../../modules/workflow/models/task.model';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model';
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-rw-jabatan-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-jabatan-pending.component.html',
  styleUrl: './rw-jabatan-pending.component.scss'
})
export class RwJabatanPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwJabatan: RWJabatan = new RWJabatan();
  jabatanList: Jabatan[] = [];
  jenjangList: Jenjang[] = [];
  pendingTask: PendingTask;

  rwJabatanForm!: FormGroup;

  inputs: FIleHandler = {
    files: {
      ijazah: { label: "Upload Dokumen SK Jabatan", source: this.rwJabatan.skJabatanUrl, required: true }
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwJabatan.fileSkJabatan = base64Data;
    }
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_jabatan/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Jabatan | Jenjang", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWJabatan(this.pendingTask.id)
          this.getJabatanList()
          this.getJenjangList()
          this.isDetailOpen = true;
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("update").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Jabatan | Jenjang", "text").build())
      .build();

      this.rwJabatanForm = new FormGroup({
        jabatanCode: new FormControl('', [Validators.required]),
        jenjangCode: new FormControl('', [Validators.required]),
        tmt: new FormControl('', [Validators.required]),
      })
  }

  getJabatanList() {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: (response) => {
        this.jabatanList = response.map((jabatan: { [key: string]: any; }) => new Jabatan(jabatan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data jabatan!");
      }
    })
  }

  getJenjangList() {
    this.apiService.getData(`/api/v1/jenjang`).subscribe({
      next: (response) => {
        this.jenjangList = response.map((jenjang: { [key: string]: any; }) => new Jenjang(jenjang))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data jenjang!");
      }
    })
  }

  getPendingRWJabatan(id: string) {
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwJabatan = new RWJabatan(pendingTask.objectTask.object);
        this.rwJabatanForm.patchValue({
          jabatanCode: this.rwJabatan.jabatanCode,
          jenjangCode: this.rwJabatan.jenjangCode,
          tmt: this.rwJabatan.tmt
        })
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data jabatan!");
      }
    });
  }

  back() {
    this.jabatanList.length = 0;
    this.jenjangList.length = 0;
    this.pendingTask = null;
    this.isDetailOpen = false;
    this.rwJabatan = new RWJabatan();
  }

  submit() {
    if (this.rwJabatanForm.valid) {
      this.rwJabatan.jabatanCode = this.rwJabatanForm.value.jabatanCode;
      this.rwJabatan.jenjangCode = this.rwJabatanForm.value.jenjangCode;
      this.rwJabatan.tmt = this.rwJabatanForm.value.tmt

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;

          const task = new Task();
          task.id = this.pendingTask.id;
          task.taskAction = "approve";
          task.object = this.rwJabatan;

          this.apiService.postData(`/api/v1/rw_jabatan/task/submit`, task).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil memperbarui riwayat jabatan.");
              this.back();
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal memperbarui riwayat jebatan!");
            }
          })
        }
      });
    }
  }
}
