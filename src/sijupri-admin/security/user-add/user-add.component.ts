import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../modules/security/models/user.model';
import { UserService } from '../../../modules/security/services/user.service';
import { RoleService } from '../../../modules/security/services/role.service';
import { Role } from '../../../modules/security/models/role.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../../modules/base/services/alert.service';
import { TabService } from '../../../modules/base/services/tab.service';
import { ApiService } from '../../../modules/base/services/api.service';
import { HandlerService } from '../../../modules/base/services/handler.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.scss'
})
export class UserAddComponent {
  user: User = new User();
  roleList: Role[];
  roleCode: string = '';
  roleCodes: string[] = [];

  constructor(
    private alertService: AlertService,
    private apiService: ApiService,
    private roleService: RoleService,
    private tabService: TabService,
    private handlerService: HandlerService,
  ) { }

  ngOnInit(): void {
    this.tabService.addTab({
      label: 'Daftar User',
      onClick: () => this.handlerService.handleNavigate('/security/user'),
    }).addTab({
      label: 'Tambah User',
      isActive: true,
      onClick: () => this.handlerService.handleNavigate('/security/user/add'),
    });

    this.roleService.findByapplicationCode("sijupri-admin").subscribe({
      next: (roleList: Role[]) => this.roleList = roleList
    });
  }

  addRoleCode(event: Event) {
    const roleCode = (event.target as HTMLSelectElement).value;
    if (roleCode && roleCode != '' && !this.roleCodes.includes(roleCode)) this.roleCodes.push(roleCode);
    (event.target as HTMLSelectElement).value = '';
  }

  removeRoleCode(roleCode: string) {
    const index = this.roleCodes.indexOf(roleCode);
    if (index > -1) this.roleCodes.splice(index, 1);
  }

  submit() {
    this.user.roleCodeList = this.roleCodes;
    this.user.applicationCode = "sijupri-admin";
    this.user.channelCodeList = ["WEB"];

    this.apiService.postData(`/api/v1/user`, this.user).subscribe({
      next: () => {
        this.alertService.showToast('Success', "Berhasil");
        this.handlerService.handleNavigate('/security/user')
      },
      error: (error) => this.handlerService.handleException(error)
    });
  }
}
