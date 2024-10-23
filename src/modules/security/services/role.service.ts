import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { Role } from '../models/role.model';
import { catchError, map } from 'rxjs';
import { Observable } from 'rxjs';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  readonly BASE_PATH = '/api/v1/role'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Role[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((role: { [key: string]: any; }) => new Role(role));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByapplicationCode(applicationCode: string): Observable<Role[]> {
    return this.apiService.getData(`${this.BASE_PATH}/application/${applicationCode}`).pipe(
      map((response: any) => {
        return response.map((role: { [key: string]: any; }) => new Role(role));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByCode(code: string): Observable<Role> {
    return this.apiService.getData(`${this.BASE_PATH}/${code}`).pipe(
      map((response: any) => {
        return new Role(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(role: Role): Observable<void> {
    return this.apiService.postData(this.BASE_PATH, role).pipe(
      catchError((error) => {
        console.error('Error save data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  update(role: Role): Observable<void> {
    return this.apiService.putData(this.BASE_PATH, role).pipe(
      catchError((error) => {
        console.error('Error update data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  delete(id: string): void {
    this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
      catchError((error) => {
        console.error('Error delete data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
