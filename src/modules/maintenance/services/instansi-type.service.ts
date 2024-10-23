import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { InstansiType } from '../models/instansi-type.model';
import { catchError, map, Observable } from 'rxjs';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class InstansiTypeService {
  readonly BASE_PATH = '/api/v1/instansi_type'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<InstansiType[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((instansiType: { [key: string]: any; }) => new InstansiType(instansiType));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
