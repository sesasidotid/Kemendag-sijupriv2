import { Injectable } from '@angular/core';
import { UserUnitKerja } from '../models/user-unit-kerja.model';
import { catchError, map, Observable } from 'rxjs';
import { AlertService } from '../../base/services/alert.service';
import { ApiService } from '../../base/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserUnitKerjaService {
  readonly BASE_PATH = '/api/v1/user_unit_kerja'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<UserUnitKerja[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((userUnitKerja: { [key: string]: any; }) => new UserUnitKerja(userUnitKerja));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByNip(nip: string): Observable<UserUnitKerja> {
    return this.apiService.getData(`${this.BASE_PATH}/${nip}`).pipe(
      map((response: any) => {
        return new UserUnitKerja(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(userUnitKerja: UserUnitKerja): Observable<void> {
    return this.apiService.postData(this.BASE_PATH, userUnitKerja).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  update(userUnitKerja: UserUnitKerja): Observable<void> {
    return this.apiService.putData(this.BASE_PATH, userUnitKerja).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
