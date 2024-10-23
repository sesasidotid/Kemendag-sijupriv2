import { Injectable } from '@angular/core';
import { AlertService } from '../../base/services/alert.service';
import { ApiService } from '../../base/services/api.service';
import { Pangkat } from '../models/pangkat.model';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PangkatService {
  readonly BASE_PATH = '/api/v1/pangkat'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Pangkat[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((pangkat: { [key: string]: any; }) => new Pangkat(pangkat));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<Pangkat> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new Pangkat(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
