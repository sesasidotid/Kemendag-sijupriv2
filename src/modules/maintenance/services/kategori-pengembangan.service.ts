import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { KategoriPengembangan } from '../models/kategori-pengembangan.model';

@Injectable({
  providedIn: 'root'
})
export class KategoriPengembanganService {
  readonly BASE_PATH = '/api/v1/kategori_pengembangan'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<KategoriPengembangan[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((kategoriPengembangan: { [key: string]: any; }) => new KategoriPengembangan(kategoriPengembangan));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<KategoriPengembangan> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new KategoriPengembangan(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
