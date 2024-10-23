import { Component } from '@angular/core';
import { ApplicationService } from '../../../security/services/application.service';
import { Application } from '../../../security/models/application.mode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models/auth-response.model';
import { LoginContext } from '../../../base/commons/login-context';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  auth: Auth = new Auth();
  authResponse: AuthResponse;
  applicationList: Application[];

  constructor(private applicationServce: ApplicationService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.getApplicationList();
  }

  getApplicationList() {
    this.applicationServce.findAll().subscribe({
      next: (applicationList: Application[]) => {
        this.applicationList = applicationList;
        this.auth.applicationCode = this.applicationList[0].code;
      }
    })
  }

  submit() {
    console.log(this.auth);
    this.authService.login(this.auth).subscribe({
      next: (authResponse: AuthResponse) => {
        this.authResponse = authResponse;
        LoginContext.storeContextLocalStorage(this.authResponse);
        this.router.navigate(['']).then(() => {
          window.location.reload();
        });
      }
    });
  }
}
