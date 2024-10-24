import { Component } from '@angular/core';
import { JF } from '../../../modules/siap/models/jf.model';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { Instansi } from '../../../modules/maintenance/models/instansi.model';
import { JfService } from '../../../modules/siap/services/jf.service';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JenisKelamin } from '../../../modules/maintenance/models/jenis-kelamin.model';
import { TabService } from '../../../modules/base/services/tab.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ApiService } from '../../../modules/base/services/api.service';

@Component({
  selector: 'app-jf-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jf-add.component.html',
  styleUrl: './jf-add.component.scss'
})
export class JfAddComponent {
  jf: JF = new JF();
  instansi: Instansi;
  unitKerja: UnitKerja;
  jenisKelaminList: JenisKelamin[];

  constructor(
    private apiService: ApiService,
    private jfService: JfService,
    private tabService: TabService,
    private handlerService: HandlerService,
  ) { }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar User Jabatan Fungsional',
      onClick: () => this.handlerService.handleNavigate(`/siap/user-jf`),
    }).addTab({
      label: 'Tambah User Jabatan Fungsional',
      isActive: true,
      onClick: () => this.handlerService.handleNavigate(`/siap/user-jf/add`),
    });


    this.jf.unitKerjaId = LoginContext.getUnitKerjaId();
    this.getJenisKelaminList();
    this.getInstansi();
    this.getUnitKerja();
  }

  getInstansi() {
    this.apiService.getData(`/api/v1/instansi/${LoginContext.getInstansiId()}`).subscribe({
      next: (instansi: Instansi) => this.instansi = instansi,
      error: (error) => this.handlerService.handleException(error)
    })
  }

  getUnitKerja() {
    this.apiService.getData(`/api/v1/unit_kerja/${LoginContext.getUnitKerjaId()}`).subscribe({
      next: (unitKerja: UnitKerja) => this.unitKerja = unitKerja,
      error: (error) => this.handlerService.handleException(error)
    })
  }

  getJenisKelaminList() {
    this.apiService.getData(`/api/v1/jenis_kelamin`).subscribe({
      next: (jenisKelaminList: JenisKelamin[]) => this.jenisKelaminList = jenisKelaminList,
      error: (error) => this.handlerService.handleException(error)
    })
  }

  submit() {
    this.jfService.save(this.jf).subscribe({
      next: () => this.handlerService.handleNavigate(LoginContext.getUserLoginRoute() +`/siap/user-jf`),
      error: (error) => this.handlerService.handleException(error)
    })
  }
}
