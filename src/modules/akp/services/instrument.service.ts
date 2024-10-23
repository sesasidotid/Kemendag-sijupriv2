import { Injectable } from '@angular/core';
import { Instrument } from '../models/instrument.model';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class InstrumentService {
  readonly BASE_PATH = '/api/v1/instrument'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Instrument[]> {
    return this.apiService.getData('/api/v1/instrument').pipe(
      map((response: any) => {
        return response.map((instrument: { [key: string]: any; }) => new Instrument(instrument));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
