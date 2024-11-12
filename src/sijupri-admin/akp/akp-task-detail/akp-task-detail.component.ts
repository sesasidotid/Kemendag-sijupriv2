import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AkpTaskService } from '../../../modules/akp/services/akp-task.service';
import { BehaviorSubject } from 'rxjs';
import { AKPTaskDetail } from '../../../modules/akp/models/akp-task-detail.modal';
import { CommonModule } from '@angular/common';
import { MatrixOneTableComponent } from '../../../modules/base/components/matrix-one-table/matrix-one-table.component';
import { MatrixTwoTableComponent } from '../../../modules/base/components/matrix-two-table/matrix-two-table.component';
import { MatrixThreeTableComponent } from '../../../modules/base/components/matrix-three-table/matrix-three-table.component';
import { VerifAKPTask } from '../../../modules/akp/models/verif-akp-task.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler';
import { fileValidator } from '../../../modules/base/validators/file-format.validator';
import { AlertService } from '../../../modules/base/services/alert.service';

@Component({
  selector: 'app-akp-task-detail',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FileHandlerComponent, MatrixOneTableComponent, MatrixTwoTableComponent, MatrixThreeTableComponent],
  templateUrl: './akp-task-detail.component.html',
  styleUrl: './akp-task-detail.component.scss'
})
export class AkpTaskDetailComponent {

  akpId: string
  AKPDetail = new AKPTaskDetail()
  currentTab$ = new BehaviorSubject<number>(1);
  
  rekomendasiPayload = new VerifAKPTask()
  form!: FormGroup;

  AKPDetailLoading$ = new BehaviorSubject<boolean>(false);
  rekomendasiSubmitLoading$ = new BehaviorSubject<boolean>(false);

  inputs: FIleHandler = {
    files: {
      ijazah: { label: "Upload Dokumen Rekomendasi AKP", required: true }
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.form.patchValue({
        rekomendasiFile: base64Data
      })
    }
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private akpTaskService: AkpTaskService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.akpId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.getAKPDetail();

    this.form = new FormGroup({
      rekomendasiFile: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    })
  }

  tabChange(tab: number) {
    this.currentTab$.next(tab);
  }

  backToList() {
    this.router.navigate(['/akp/akp-task-list']);
  }

  getAKPDetail() {
    this.AKPDetailLoading$.next(true)
    this.akpTaskService.getAKPTaskDetailById(this.akpId).subscribe({
      next: (response) => {
        this.AKPDetail = response;
        console.log(this.AKPDetail)
      },
      complete: () => {
        this.AKPDetailLoading$.next(false)
      }
    })
  }

  rekomendasiSubmit() {
    this.rekomendasiSubmitLoading$.next(true)
    this.rekomendasiPayload.id = this.AKPDetail.id;
    this.rekomendasiPayload.taskAction = 'approve';
    this.rekomendasiPayload.object = {
      rekomendasiFile: this.form.get('rekomendasiFile').value
    }

    this.akpTaskService.verifAKPTask(this.rekomendasiPayload).subscribe({
      next: () => {
        this.alertService.showToast('Success', 'Berhasil memberikan rekomendasi AKP.');
        this.rekomendasiSubmitLoading$.next(false)
        this.router.navigate(['/akp/akp-task-list']);
      },
      error: (error) => {
        this.alertService.showToast('Error', 'Gagal memberikan rekomendasi AKP.');
        this.rekomendasiSubmitLoading$.next(false)
      }
    })
  }

}
