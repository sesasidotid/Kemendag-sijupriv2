import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { Auth } from '../models/auth.model';
import { catchError, map, Observable } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly BASE_PATH = '/oauth/token'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  login(auth: Auth): Observable<AuthResponse> {
    auth.clientId = auth.applicationCode;
    auth.clientSecret = `${auth.applicationCode}P@ssw0rd`;
    auth.grantType = "password";

    return this.apiService.auth(this.BASE_PATH, auth).pipe(
      map((response: any) => new AuthResponse(response)),
      catchError((error) => {
        console.error('Error login', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
