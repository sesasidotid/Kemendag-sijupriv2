import { Injectable } from '@angular/core';
import { KabKota } from '../models/kab-kota.model';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class KabKotaService {
  readonly BASE_PATH = '/api/v1/kab_kota'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<KabKota[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((kabKota: { [key: string]: any; }) => new KabKota(kabKota));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(kabkotaId: string): Observable<KabKota> {
    return this.apiService.getData(`${this.BASE_PATH}/${kabkotaId}`).pipe(
      map((response: any) => {
        return new KabKota(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByTypeAndProvinsiId(type: string, provinsiId: number): Observable<KabKota[]> {
    return this.apiService.getData(`${this.BASE_PATH}/type/${type}/${provinsiId}`).pipe(
      map((response: any) => {
        return response.map((provinsi: { [key: string]: any; }) => new KabKota(provinsi));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(kabKota: KabKota): void {
    this.apiService.postData(this.BASE_PATH, kabKota).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  update(kabKota: KabKota): void {
    this.apiService.putData(this.BASE_PATH, kabKota).pipe(
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
