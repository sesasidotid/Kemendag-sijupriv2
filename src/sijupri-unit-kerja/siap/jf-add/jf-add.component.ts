import { Component } from '@angular/core';
import { JF } from '../../../modules/siap/models/jf.model';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { Instansi } from '../../../modules/maintenance/models/instansi.model';
import { UnitKerjaService } from '../../../modules/maintenance/services/unit-kerja.service';
import { InstansiService } from '../../../modules/maintenance/services/instansi.service';
import { JfService } from '../../../modules/siap/services/jf.service';
import { Router } from '@angular/router';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JenisKelaminService } from '../../../modules/maintenance/services/jenis-kelamin.service';
import { JenisKelamin } from '../../../modules/maintenance/models/jenis-kelamin.model';

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
    private jfService: JfService,
    private unitKerjaService: UnitKerjaService,
    private instansiService: InstansiService,
    private jenisKelaminService: JenisKelaminService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.jf.unitKerjaId = LoginContext.getUnitKerjaId();
    this.getJenisKelaminList();
    this.getInstansi();
    this.getUnitKerja();
  }

  getInstansi() {
    this.instansiService.findById(LoginContext.getInstansiId()).subscribe({
      next: (instansi: Instansi) => this.instansi = instansi
    })
  }

  getUnitKerja() {
    this.unitKerjaService.findById(LoginContext.getUnitKerjaId()).subscribe({
      next: (unitKerja: UnitKerja) => this.unitKerja = unitKerja
    })
  }

  getJenisKelaminList() {
    this.jenisKelaminService.findAll().subscribe({
      next: (jenisKelaminList: JenisKelamin[]) => this.jenisKelaminList = jenisKelaminList
    })
  }

  submit() {
    this.jfService.save(this.jf).subscribe({
      next: () => this.router.navigate(['/siap/user-jf'])
    })
  }
}
