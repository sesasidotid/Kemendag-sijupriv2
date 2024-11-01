import { Component } from '@angular/core';
import { JF } from '../../../modules/siap/models/jf.model';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { Instansi } from '../../../modules/maintenance/models/instansi.model';
import { JfService } from '../../../modules/siap/services/jf.service';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JenisKelamin } from '../../../modules/maintenance/models/jenis-kelamin.model';
import { TabService } from '../../../modules/base/services/tab.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ApiService } from '../../../modules/base/services/api.service';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from '../../../modules/base/services/alert.service';

@Component({
  selector: 'app-jf-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './jf-add.component.html',
  styleUrl: './jf-add.component.scss'
})
export class JfAddComponent {
  jf: JF = new JF();
  instansi: Instansi;
  unitKerja: UnitKerja;
  jenisKelaminList: JenisKelamin[];

  loadingInstansi$ = new BehaviorSubject<boolean>(true);
  loadingUnitKerja$ = new BehaviorSubject<boolean>(true);

  jfAddForm!: FormGroup;

  constructor(
    private apiService: ApiService,
    private jfService: JfService,
    private tabService: TabService,
    private handlerService: HandlerService,
    private alertService: AlertService,
  ) {
    this.jfAddForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      jenisKelaminCode: new FormControl('', [Validators.required]),
      nip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(18)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    if(this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs();
    }
    this.tabService.addTab({
      label: 'Daftar User Jabatan Fungsional',
      icon: 'mdi-list-box',
      onClick: () => this.handlerService.handleNavigate(`/siap/user-jf`),
    }).addTab({
      label: 'Tambah User Jabatan Fungsional',
      icon: 'mdi-plus-circle',
      isActive: true,
      onClick: () => this.handlerService.handleNavigate(`/siap/user-jf/add`),
    });

    this.jf.unitKerjaId = LoginContext.getUnitKerjaId();
    this.getJenisKelaminList();
    this.getInstansi();
    this.getUnitKerja();
  }

  getInstansi() {
    this.loadingInstansi$.next(true);
    this.apiService.getData(`/api/v1/instansi/${LoginContext.getInstansiId()}`).subscribe({
      next: (instansi: Instansi) => {
        this.instansi = instansi
        this.loadingInstansi$.next(false);
      },
      error: (error) => {
        this.handlerService.handleException(error)
        this.loadingInstansi$.next(false)
      }
    })
  }

  getUnitKerja() {
    this.loadingUnitKerja$.next(true);
    this.apiService.getData(`/api/v1/unit_kerja/${LoginContext.getUnitKerjaId()}`).subscribe({
      next: (unitKerja: UnitKerja) => {
        this.unitKerja = unitKerja
        this.loadingUnitKerja$.next(false);
      },
      error: (error) => {
        this.handlerService.handleException(error)
        this.loadingUnitKerja$.next(false)
      }
    })
  }

  getJenisKelaminList() {
    this.apiService.getData(`/api/v1/jenis_kelamin`).subscribe({
      next: (jenisKelaminList: JenisKelamin[]) => this.jenisKelaminList = jenisKelaminList,
      error: (error) => this.handlerService.handleException(error)
    })
  }

  submit() {
    if (this.jfAddForm.valid) {
      this.jf.name = this.jfAddForm.value.name;
      this.jf.jenisKelaminCode = this.jfAddForm.value.jenisKelaminCode;
      this.jf.nip = this.jfAddForm.value.nip;
      this.jf.email = this.jfAddForm.value.email;
      this.jf.password = this.jfAddForm.value.password;
      // console.log(this.jf)

      this.jfService.save(this.jf).subscribe({
        next: () => {
          this.alertService.showToast('Success', "Berhasil menambah user JF.");
          this.handlerService.handleNavigate(`/siap/user-jf`)
        },
        error: (error) => this.alertService.showToast('Error', "Gagal menambahkan user JF!")
      })
    }
  }
}
