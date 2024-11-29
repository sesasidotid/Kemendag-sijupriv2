import { Component } from '@angular/core';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Router } from '@angular/router';
import { TabService } from '../../../modules/base/services/tab.service';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AkpPelatihanAddComponent } from '../akp-pelatihan-add/akp-pelatihan-add.component';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { ModalComponent } from '../../../modules/base/components/modal/modal.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PelatihanTeknis } from '../../../modules/akp/models/pelatihan-teknis.model';

@Component({
  selector: 'app-akp-pelatihan-list',
  standalone: true,
  imports: [CommonModule, PagableComponent, AkpPelatihanAddComponent, ModalComponent, ReactiveFormsModule],
  templateUrl: './akp-pelatihan-list.component.html',
  styleUrl: './akp-pelatihan-list.component.scss'
})
export class AkpPelatihanListComponent {
  pagable: Pagable;
  form!: FormGroup;

  tab$ = new BehaviorSubject<number | null>(0);
  isModalOpen$ = new BehaviorSubject<boolean>(false);
  selectedPelatihan$ = new BehaviorSubject<PelatihanTeknis | null>(null);

  constructor(
    private router: Router,
    private tabService: TabService,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/akp_pelatihan_teknis/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama Pelatihan", 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Jabatan", 'jabatanName').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pelatihan: any) => {
        this.toggleModal();
        this.form.get('id').setValue(pelatihan.id);
        this.form.get('name').setValue(pelatihan.name);
        this.form.get('code').setValue(pelatihan.code);
      }, "primary").withIcon("update").build())
      .addActionColumn(new ActionColumnBuilder().setAction((pelatihan: any) => {
        this.handleDelete(pelatihan.id)
      }, "danger").withIcon("danger").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name").withField("Nama Pelatihan", "text").build())
      .build();

    this.form = new FormGroup({
      id: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs();
    }

    this.tabService.addTab({
      label: 'Daftar Pelatihan Teknis',
      icon: 'mdi-list-box',
      isActive: true,
      onClick: () => this.handleTabChange(0),
    }).addTab({
      label: 'Tambah Pelatihan Teknis',
      icon: 'mdi-plus-circle',
      onClick: () => this.handleTabChange(1),
    });
  }

  toggleModal() {
    this.isModalOpen$.next(!this.isModalOpen$.value);
  }

  handleTabChange(tab?: number) {
    this.tab$.next(tab);
    this.tabService.changeTabActive(tab);
  }

  handleDelete(pelatihanId: string) {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;
        this.apiService.deleteData(`/api/v1/akp_pelatihan_teknis/${pelatihanId}`).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil menghapus pelatihan.");
            this.tab$.next(null);
            setTimeout(() => {
              this.tab$.next(0);
            }, 100);
          },
          error: (error) => {
            console.log("error", error);
            this.alertService.showToast("Error", "Gagal menghapus pelatihan!");
          }
        })
      }
    });
  }

  updateSumbit() {
    if (this.form.valid) {
      // console.log("this.form.value", this.form.value);
      this.apiService.putData(`/api/v1/akp_pelatihan_teknis`, this.form.value).subscribe({
        next: () => {
          this.alertService.showToast('Success', "Pelatihan Teknis berhasil diubah!");
          this.toggleModal();
          this.tab$.next(null);
          setTimeout(() => {
            this.tab$.next(0);
          }, 100);
        },
        error: (error) => {
          console.log("error", error);
          this.alertService.showToast("Error", "Gagal mengubah pelatihan teknis!");
        }
      })
    }
  }
}
