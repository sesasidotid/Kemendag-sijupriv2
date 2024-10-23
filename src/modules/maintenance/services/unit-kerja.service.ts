import { Injectable } from '@angular/core';
import { UnitKerja } from '../models/unit-kerja.model';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class UnitKerjaService {
  readonly BASE_PATH = '/api/v1/unit_kerja'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<UnitKerja[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((unitKerja: { [key: string]: any; }) => new UnitKerja(unitKerja));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(unitKerjaId: string): Observable<UnitKerja> {
    return this.apiService.getData(`${this.BASE_PATH}/${unitKerjaId}`).pipe(
      map((response: any) => {
        return new UnitKerja(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(unitKerja: UnitKerja): Observable<void> {
    return this.apiService.postData(this.BASE_PATH, unitKerja).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  update(unitKerja: UnitKerja): void {
    this.apiService.putData(this.BASE_PATH, unitKerja).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  delete(id: string): void {
    this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
