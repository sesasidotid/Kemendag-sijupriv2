import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserUnitKerja } from '../../../modules/siap/models/user-unit-kerja.model';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ApiService } from '../../../modules/base/services/api.service';
import { TabService } from '../../../modules/base/services/tab.service';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-user-unit-kerja-add',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-unit-kerja-add.component.html',
  styleUrl: './user-unit-kerja-add.component.scss'
})
export class UserUnitKerjaAddComponent {
  userUnitKerja: UserUnitKerja = new UserUnitKerja();
  unitKerjaList: UnitKerja[];

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private tabService: TabService,
  ) { }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar User Unit Kerja',
      onClick: () => this.handlerService.handleNavigate(LoginContext.getUserLoginRoute() +`/siap/user-unit-kerja`),
    }).addTab({
      label: 'Tambah User Unit Kerja',
      isActive: true,
      onClick: () => this.handlerService.handleNavigate(LoginContext.getUserLoginRoute() +`/siap/user-unit-kerja/add`),
    });

    this.getUnitKerjaList();
  }

  getUnitKerjaList() {
    this.apiService.getData(`/api/v1/unit_kerja`).subscribe({
      next: (unitKerjaList: UnitKerja[]) => this.unitKerjaList = unitKerjaList,
      error: (error) => this.handlerService.handleException(error)
    })
  }

  submit() {
    this.apiService.postData(`/api/v1/user_unit_kerja`, this.userUnitKerja).subscribe({
      next: () => this.handlerService.handleNavigate(LoginContext.getUserLoginRoute() +`/siap/user-unit-kerja`),
      error: (error) => this.handlerService.handleException(error)
    })
  }
}
