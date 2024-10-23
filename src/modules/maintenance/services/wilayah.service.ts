import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { Wilayah } from '../models/wilayah.model';
import { catchError, map, Observable } from 'rxjs';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class WilayahService {
  readonly BASE_PATH = '/api/v1/wilayah'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) { }

  findAll(): Observable<Wilayah[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((wilayah: { [key: string]: any; }) => new Wilayah(wilayah));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
