import { Component } from '@angular/core';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { UserUnitKerja } from '../../../modules/siap/models/user-unit-kerja.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserUnitKerjaService } from '../../../modules/siap/services/user-unit-kerja.service';
import { AlertService } from '../../../modules/base/services/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userUnitKerja: UserUnitKerja = new UserUnitKerja();
  nip: string = LoginContext.getUserId();
  name: string = LoginContext.getName();

  constructor(
    private userUnitKerjaService: UserUnitKerjaService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getUserUnitKerja();
  }

  getUserUnitKerja() {
    this.userUnitKerjaService.findByNip(this.nip).subscribe({
      next: (userUnitKerja: UserUnitKerja) => this.userUnitKerja = userUnitKerja,
    })
  }

  submit() {
    this.userUnitKerjaService.update(this.userUnitKerja).subscribe({
      next: () => {
        this.alertService.showToast('Success', "Berhasil");
      }
    })
  }
}
