import { Component } from '@angular/core';
import { PagableComponent } from "../../../modules/base/components/pagable/pagable.component";
import { Instrument } from '../../../modules/akp/models/instrument.model';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../../../modules/base/services/alert.service';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { TabService } from '../../../modules/base/services/tab.service';
import { ModalComponent } from '../../../modules/base/components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AkpTaskService } from '../../../modules/akp/services/akp-task.service';
import { VerifAKPTask } from '../../../modules/akp/models/verif-akp-task.model';

@Component({
  selector: 'app-akp-task-list',
  standalone: true,
  imports: [PagableComponent, ModalComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './akp-task-list.component.html',
  styleUrl: './akp-task-list.component.scss'
})
export class AKPTaskComponent {
  form!: FormGroup;
  instrumentList: Instrument[];
  pagable: Pagable;

  payload = new VerifAKPTask();

  isModalOpen$ = new BehaviorSubject<boolean>(false);
  taskId$ = new BehaviorSubject<string>('');
  action$ = new BehaviorSubject<"approve" | "reject">('approve');

  constructor(
    private tabService: TabService,
    private akpTaskService: AkpTaskService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.pagable = new PagableBuilder("/api/v1/akp/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("NIP", 'objectId').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama AKP", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Proses", 'flowName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'taskStatus').build())
      .addActionColumn(new ActionColumnBuilder().setAction((task: any) => {
        this.router.navigate([`/akp/akp-task-list/${task.id}`])
      }, "info").addInactiveCondition((task: any) => task.flowId === 'akp_flow_1').withIcon("detail").build())
      .addActionColumn(new ActionColumnBuilder().setAction((task: any) => {
        this.taskId$.next(task.id);
        this.toggleModal();
      }, "primary").addInactiveCondition((task: any) => task.flowId !== 'akp_flow_1').withIcon("update").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectId").withField("NIP", "text").build())
      .build();

    this.form = new FormGroup({
      nama_atasan: new FormControl('', [Validators.required]),
      email_atasan: new FormControl('', [Validators.required, Validators.email]),
      remark: new FormControl('', [Validators.required]),
    });
  }

  toggleModal() {
    this.isModalOpen$.next(!this.isModalOpen$.value);
  }

  handleSave() {
    if (this.action$.value === 'approve') {
      if (this.form.get('nama_atasan').valid && this.form.get('email_atasan').valid) {
        this.payload.id = this.taskId$.value;
        this.payload.taskAction = 'approve';
        this.payload.object = {
          emailAtasan: this.form.get('email_atasan').value,
          namaAtasan: this.form.get('nama_atasan').value,
        }

        this.akpTaskService.verifAKPTask(this.payload).subscribe({
          next: () => {
            this.alertService.showToast('Success', 'Berhasil menerima pengajuan AKP.');
            this.toggleModal();
            setTimeout(() => {window.location.reload();}, 1000);
          },
          error: (error) => {
            this.alertService.showToast('Error', 'Gagal menerima pengajuan AKP.');
            this.toggleModal();
          }          
        });
      }
    } else if (this.action$.value === 'reject') {
      if (this.form.get('remark').valid) {
        this.payload.id = this.taskId$.value;
        this.payload.taskAction = 'reject';
        this.payload.remark = this.form.get('remark').value;

        this.akpTaskService.verifAKPTask(this.payload).subscribe({
          next: () => {
            this.alertService.showToast('Success', 'Berhasil menolak pengajuan AKP.');
            this.toggleModal();
            setTimeout(() => {window.location.reload();}, 1000);
          },
          error: (error) => {
            this.alertService.showToast('Error', 'Gagal menolak pengajuan AKP.');
            this.toggleModal();
          }          
        });
      }
    }
  }
}
