import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { Jabatan } from '../models/jabatan.model';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class JabatanService {
  readonly BASE_PATH = '/api/v1/jabatan'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Jabatan[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((jabatan: { [key: string]: any; }) => new Jabatan(jabatan));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<Jabatan> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new Jabatan(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
