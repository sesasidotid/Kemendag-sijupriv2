import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { Provinsi } from '../models/provinsi.model';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class ProvinsiService {
  readonly BASE_PATH = '/api/v1/provinsi'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Provinsi[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((provinsi: { [key: string]: any; }) => new Provinsi(provinsi));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(provinsiId: string): Observable<Provinsi> {
    return this.apiService.getData(`${this.BASE_PATH}/${provinsiId}`).pipe(
      map((response: any) => {
        return new Provinsi(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(provinsi: Provinsi): void {
    this.apiService.postData(this.BASE_PATH, provinsi).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  update(provinsi: Provinsi): void {
    this.apiService.putData(this.BASE_PATH, provinsi).pipe(
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
