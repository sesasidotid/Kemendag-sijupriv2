import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { Pendidikan } from '../models/pendidikan.model';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PendidikanService {
  readonly BASE_PATH = '/api/v1/pendidikan'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Pendidikan[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((pendidikan: { [key: string]: any; }) => new Pendidikan(pendidikan));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<Pendidikan> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new Pendidikan(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
