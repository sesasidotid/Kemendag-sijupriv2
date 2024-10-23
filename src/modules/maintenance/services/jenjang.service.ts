import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { Jenjang } from '../models/jenjang.modle';

@Injectable({
  providedIn: 'root'
})
export class JenjangService {
  readonly BASE_PATH = '/api/v1/jenjang'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Jenjang[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((jenjang: { [key: string]: any; }) => new Jenjang(jenjang));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<Jenjang> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new Jenjang(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
