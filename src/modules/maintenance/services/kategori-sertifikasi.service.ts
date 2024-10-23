import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { KategoriSertifikasi } from '../models/kategori-sertifikasi.model';

@Injectable({
  providedIn: 'root'
})
export class KategoriSertifikasiService {
  readonly BASE_PATH = '/api/v1/kategori_sertifikasi'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<KategoriSertifikasi[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((kategoriSertifikasi: { [key: string]: any; }) => new KategoriSertifikasi(kategoriSertifikasi));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<KategoriSertifikasi> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new KategoriSertifikasi(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
