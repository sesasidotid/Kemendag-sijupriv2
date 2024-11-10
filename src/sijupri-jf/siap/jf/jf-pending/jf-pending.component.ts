import { Component } from '@angular/core';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { JenisKelamin } from '../../../../modules/maintenance/models/jenis-kelamin.model';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { JF } from '../../../../modules/siap/models/jf.model';
import { LoginContext } from '../../../../modules/base/commons/login-context';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../modules/workflow/models/task.model';
import { HandlerService } from '../../../../modules/base/services/handler.service';
import { BehaviorSubject } from 'rxjs';
import { EmptyStateComponent } from '../../../../modules/base/components/empty-state/empty-state.component';
import { Router } from '@angular/router';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';

@Component({
  selector: 'app-jf-pending',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './jf-pending.component.html',
  styleUrl: './jf-pending.component.scss'
})
export class JfPendingComponent {
  jf: JF = new JF();
  jenisKelaminList: JenisKelamin[] = [];
  pendingTask: PendingTask;
  nip: string = LoginContext.getUserId();

  loading$ = new BehaviorSubject<boolean>(true);

  jfDetailForm!: FormGroup;

  inputs: FIleHandler = {
    files: {},
    viewOnly: true,
    listen: (key: string, source: string, base64Data: string) => {
      this.jfDetailForm.patchValue({ fileKtp: base64Data });
    }
  }

  ngOnInit() {
    this.getPendingTask();
    this.getJenisKelamin();

    console.log(this.pendingTask)
  }

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.jfDetailForm = new FormGroup({
      name: new FormControl(this.jf.name, [Validators.required]),
      phone: new FormControl(this.jf.phone, [Validators.required, Validators.pattern('^[0-9]+$')]),
      email: new FormControl(this.jf.email, [Validators.required, Validators.email]),
      tempatLahir: new FormControl(this.jf.tempatLahir, [Validators.required]),
      tanggalLahir: new FormControl(this.jf.tanggalLahir, [Validators.required]),
      jenisKelaminCode: new FormControl(this.jf.jenisKelaminCode, [Validators.required]),
      nik: new FormControl(this.jf.nik, [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(13)],),
      fileKtp: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    });
  }

  getPendingTask() {
    this.loading$.next(true);
    this.apiService.getData(`/api/v1/jf/expect_pending/${this.nip}`).subscribe({
      next: (response) => {
        this.pendingTask = new PendingTask(response);
        this.jf = new JF(this.pendingTask.objectTask.object);

        this.jfDetailForm.patchValue({
          name: this.jf.name,
          phone: this.jf.phone,
          email: this.jf.email,
          tempatLahir: this.jf.tempatLahir,
          tanggalLahir: this.jf.tanggalLahir,
          jenisKelaminCode: this.jf.jenisKelaminCode,
          nik: this.jf.nik,
        })

        this.inputs.files['ktp'] = { label: "Upload Dokumen KTP", source: this.jf.ktpUrl, required: true };
        this.inputs.viewOnly = this.pendingTask.flowId == 'siap_flow_1'

        if (this.pendingTask.flowId == 'siap_flow_1') {
          this.jfDetailForm.get('name')?.disable()
          this.jfDetailForm.get('phone')?.disable()
          this.jfDetailForm.get('email')?.disable()
          this.jfDetailForm.get('tempatLahir')?.disable()
          this.jfDetailForm.get('tanggalLahir')?.disable()
          this.jfDetailForm.get('jenisKelaminCode')?.disable()
          this.jfDetailForm.get('nik')?.disable()
        }
        this.loading$.next(false);
      },
      error: (error) => {
        // this.alertService.showToast('Error', "Gagal mendapatkan data profil!");
        this.handlerService.handleException(error);
        this.loading$.next(false);
      }
    })
  }

  getJenisKelamin() {
    this.apiService.getData(`/api/v1/jenis_kelamin`).subscribe({
      next: (response) => {
        this.jenisKelaminList = response.map((jenisKelamin: { [key: string]: any; }) => new JenisKelamin(jenisKelamin));
      },
      error: (error) => {
        this.handlerService.handleException(error);
      }
    })
  }

  ajukanPerubahan() {
    this.router.navigate(['/profile']);
  }

  submit() {
    if (this.jfDetailForm.valid) {
      this.jf.name = this.jfDetailForm.value.name;
      this.jf.phone = this.jfDetailForm.value.phone;
      this.jf.email = this.jfDetailForm.value.email;
      this.jf.tempatLahir = this.jfDetailForm.value.tempatLahir;
      this.jf.tanggalLahir = this.jfDetailForm.value.tanggalLahir;
      this.jf.jenisKelaminCode = this.jfDetailForm.value.jenisKelaminCode;
      this.jf.nik = this.jfDetailForm.value.nik;
      this.jf.ktpUrl = this.jfDetailForm.value.fileKtp;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          const task = new Task();
          task.id = this.pendingTask.id;
          task.taskAction = 'approve';
          task.object = this.jf;
  
          this.apiService.postData(`/api/v1/jf/task/submit`, task).subscribe({
            next: () => {
              this.handlerService.handleAlert('Success', "Berhasil mengajukan perubahan data.");
              window.location.reload();
            }
          })
        }
      })
    }

  }
}
