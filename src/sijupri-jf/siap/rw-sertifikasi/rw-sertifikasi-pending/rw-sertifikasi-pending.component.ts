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
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KategoriSertifikasi } from '../../../../modules/maintenance/models/kategori-sertifikasi.model';
import { Task } from '../../../../modules/workflow/models/task.model';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { BehaviorSubject } from 'rxjs';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';

@Component({
  selector: 'app-rw-sertifikasi-pending',
  standalone: true,
  imports: [PagableComponent, CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-sertifikasi-pending.component.html',
  styleUrl: './rw-sertifikasi-pending.component.scss'
})
export class RwSertifikasiPendingComponent {
  pagable: Pagable;
  isDetailOpen: boolean = false;
  rwSertifikasi: RWSertifikasi = new RWSertifikasi();
  kategoriSertifikasiList: KategoriSertifikasi[] = [];
  pendingTask: PendingTask;

  kategori$ = new BehaviorSubject<number>(1);
  rwSertifikasiLoading$ = new BehaviorSubject<boolean>(false);
  kategoriChangeLoading$ = new BehaviorSubject<boolean>(false);
  kategoriLoading$ = new BehaviorSubject<boolean>(false);
  submitLoading$ = new BehaviorSubject<boolean>(false);

  rwSertifikasiForm!: FormGroup;

  inputs: FIleHandler;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/rw_sertifikasi/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Sertifikasi", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: PendingTask) => {
        this.pendingTask = pendingTask;
        if (pendingTask.flowId == 'siap_flow_2') {
          this.getPendingRWSertifikasi(this.pendingTask.id)
          this.getKategoriSertifikasiList()
          this.isDetailOpen = true;
        }
      }, "info").addInactiveCondition((pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1').withIcon("update").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Sertifikasi", "text").build())
      .build();

    this.getKategoriSertifikasiList();
  }

  fileLoadHandler() {
    this.inputs = {
      files: {
        skPengangkatan: { label: "Upload Dokumen SK Pengangkatan", fileName: this.rwSertifikasi.skPengangkatan, source: this.rwSertifikasi.skPengangkatanUrl, required: true },
        ktpPpns: { label: "Upload Dokumen KTP PPNS", fileName: this.rwSertifikasi.ktpPpns, source: this.rwSertifikasi.ktpPpnsUrl, visible: () => this.kategori$.value == 2, required: true }
      },
      listen: (key: string, source: string, base64Data: string) => {
        console.log('key', key);
        if (key == "skPengangkatan"){
          this.rwSertifikasiForm.patchValue({ fileSkPengangkatan: base64Data });
        }
        if (key == "ktpPpns") {
          this.rwSertifikasiForm.patchValue({ fileKtpPpns: base64Data });
        }
      }
    }
  }

  getKategoriSertifikasiList() {
    this.kategoriLoading$.next(true);
    this.apiService.getData(`/api/v1/kategori_sertifikasi`).subscribe({
      next: (response) => {
        this.kategoriSertifikasiList = response.map((kategoriSertifikasi: { [key: string]: any; }) => new KategoriSertifikasi(kategoriSertifikasi))
        // this.rwSertifikasi.kategoriSertifikasiId = this.kategoriSertifikasiList[0].id;
        this.kategoriLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data kategori sertifikasi!");
      }
    })
  }

  setKategori(kategoriSertifikasiValue: number, kategoriSertifikasiId: string) {
    this.kategoriChangeLoading$.next(true);
    this.kategori$.next(kategoriSertifikasiValue);
    this.rwSertifikasi.kategoriSertifikasiId = kategoriSertifikasiId;

    if (kategoriSertifikasiValue === 1) {
      this.rwSertifikasiForm = new FormGroup({
        noSk: new FormControl('', [Validators.required]),
        tglSk: new FormControl('', [Validators.required]),
        fileSkPengangkatan: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
      })
      this.fileLoadHandler();
      this.rwSertifikasiForm.patchValue({
        noSk: this.rwSertifikasi.noSk,
        tglSk: this.rwSertifikasi.tglSk,
      })
      this.kategoriChangeLoading$.next(false);
      // console.log(this.rwSertifikasiForm.value);
    }
    else if (kategoriSertifikasiValue === 2) {
      this.rwSertifikasiForm = new FormGroup({
        noSk: new FormControl('', [Validators.required]),
        tglSk: new FormControl('', [Validators.required]),
        dateStart: new FormControl('', [Validators.required]),
        dateEnd: new FormControl('', [Validators.required]),
        wilayahKerja: new FormControl('', [Validators.required]),
        uuKawalan: new FormControl('', [Validators.required]),
        fileSkPengangkatan: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
        fileKtpPpns: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
      })
      this.fileLoadHandler();
      this.rwSertifikasiForm.patchValue({
        noSk: this.rwSertifikasi.noSk,
        tglSk: this.rwSertifikasi.tglSk,
        dateStart: this.rwSertifikasi.dateStart,
        dateEnd: this.rwSertifikasi.dateEnd,
        wilayahKerja: this.rwSertifikasi.wilayahKerja,
        uuKawalan: this.rwSertifikasi.uuKawalan,
      })
      this.kategoriChangeLoading$.next(false);
      // console.log(this.rwSertifikasiForm.value);
    }
  }

  getPendingRWSertifikasi(id: string) {
    this.rwSertifikasiLoading$.next(true);
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: (response) => {
        const pendingTask = new PendingTask(response);
        this.rwSertifikasi = new RWSertifikasi(pendingTask.objectTask.object);
        this.kategori$.next(this.rwSertifikasi.kategoriSertifikasiValue);

        if (this.kategori$.value === 1) {
          this.rwSertifikasiForm = new FormGroup({
            noSk: new FormControl('', [Validators.required]),
            tglSk: new FormControl('', [Validators.required]),
            fileSkPengangkatan: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
          })

          this.rwSertifikasiForm.patchValue({
            noSk: this.rwSertifikasi.noSk,
            tglSk: this.rwSertifikasi.tglSk,
          })
        }
        else if (this.kategori$.value === 2) {
          this.rwSertifikasiForm = new FormGroup({
            noSk: new FormControl('', [Validators.required]),
            tglSk: new FormControl('', [Validators.required]),
            dateStart: new FormControl('', [Validators.required]),
            dateEnd: new FormControl('', [Validators.required]),
            wilayahKerja: new FormControl('', [Validators.required]),
            uuKawalan: new FormControl('', [Validators.required]),
            fileSkPengangkatan: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
            fileKtpPpns: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
          })

          this.rwSertifikasiForm.patchValue({
            noSk: this.rwSertifikasi.noSk,
            tglSk: this.rwSertifikasi.tglSk,
            dateStart: this.rwSertifikasi.dateStart,
            dateEnd: this.rwSertifikasi.dateEnd,
            wilayahKerja: this.rwSertifikasi.wilayahKerja,
            uuKawalan: this.rwSertifikasi.uuKawalan,
          })
        }
        // this.isDetailOpen = true;
        this.fileLoadHandler();
        this.rwSertifikasiLoading$.next(false);
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
    if (this.rwSertifikasiForm.valid) {
      this.rwSertifikasi.noSk = this.rwSertifikasiForm.value.noSk;
      this.rwSertifikasi.tglSk = this.rwSertifikasiForm.value.tglSk;
      this.rwSertifikasi.dateStart = this.rwSertifikasiForm.value.dateStart;
      this.rwSertifikasi.dateEnd = this.rwSertifikasiForm.value.dateEnd;
      this.rwSertifikasi.wilayahKerja = this.rwSertifikasiForm.value.wilayahKerja;
      this.rwSertifikasi.uuKawalan = this.rwSertifikasiForm.value.uuKawalan;
      this.rwSertifikasi.fileKtpPpns = this.rwSertifikasiForm.value.fileKtpPpns;
      this.rwSertifikasi.fileSkPengangkatan = this.rwSertifikasiForm.value.fileSkPengangkatan;


      if (this.kategori$.value === 1) {
        this.rwSertifikasi.dateEnd = undefined;
        this.rwSertifikasi.dateStart = undefined;
        this.rwSertifikasi.wilayahKerja = undefined;
        this.rwSertifikasi.uuKawalan = undefined;
        this.rwSertifikasi.ktpPpns = undefined;
        this.rwSertifikasi.ktpPpnsUrl = undefined;
        this.rwSertifikasi.fileKtpPpns = undefined;
        this.rwSertifikasi.kategoriSertifikasiId = this.kategoriSertifikasiList[0].id;
        this.rwSertifikasi.kategoriSertifikasiValue = 1;
        this.rwSertifikasi.kategoriSertifikasiName = this.kategoriSertifikasiList[0].name;
      }
      if (this.kategori$.value === 2) {
        this.rwSertifikasi.kategoriSertifikasiId = this.kategoriSertifikasiList[1].id;
        this.rwSertifikasi.kategoriSertifikasiValue = 2;
        this.rwSertifikasi.kategoriSertifikasiName = this.kategoriSertifikasiList[1].name;
      }

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          this.submitLoading$.next(true);

          const task = new Task();
          task.id = this.pendingTask.id;
          task.taskAction = "approve";
          task.object = this.rwSertifikasi;

          this.apiService.postData(`/api/v1/rw_sertifikasi/task/submit`, task).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil mengubah riwayat sertifikasi.");
              this.submitLoading$.next(false);
              this.back();
            },
            error: (error) => {
              console.log("error", error);
              this.submitLoading$.next(false);
              this.alertService.showToast("Error", "gagal mengirim data");
            }
          })
        }
      })
    }

  }
}
