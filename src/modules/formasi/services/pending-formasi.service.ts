import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { catchError, map, Observable } from 'rxjs';
import { FormasiRequest } from '../models/formasi-request.model';
import { FormasiUnsur } from '../models/formasi-unsur.model';

@Injectable({
  providedIn: 'root'
})
export class PendingFormasiService {
  readonly BASE_PATH = '/api/v1/pending_formasi'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findTree(unitKerjaId: string, jabatanCode: string): Observable<FormasiUnsur[]> {
    return this.apiService.getData(`${this.BASE_PATH}/tree/${unitKerjaId}/${jabatanCode}`).pipe(
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

  save(formasiRequest: FormasiRequest): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}`, formasiRequest).pipe(
      catchError((error) => {
        console.error('Error save formasi', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
