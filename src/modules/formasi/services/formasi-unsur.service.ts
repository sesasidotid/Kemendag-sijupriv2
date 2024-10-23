import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { FormasiUnsur } from '../models/formasi-unsur.model';

@Injectable({
  providedIn: 'root'
})
export class FormasiUnsurService {
  readonly BASE_PATH = '/api/v1/unsur'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }


  findTree(jabatanCode: string): Observable<FormasiUnsur[]> {
    return this.apiService.getData(`${this.BASE_PATH}/tree/${jabatanCode}`).pipe(
      map((response: any) => {
        return response.map((formasiUnsur: { [key: string]: any; }) => new FormasiUnsur(formasiUnsur));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
