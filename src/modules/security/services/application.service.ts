import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { catchError, map, Observable } from 'rxjs';
import { Application } from '../models/application.mode';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  readonly BASE_PATH = '/api/v1/application'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Application[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((application: { [key: string]: any; }) => new Application(application));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
