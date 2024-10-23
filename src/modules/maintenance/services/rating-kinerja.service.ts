import { Injectable } from '@angular/core';
import { RatingKinerja } from '../models/rating-kinerja.model';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class RatingKinerjaService {
  readonly BASE_PATH = '/api/v1/rating_kinerja'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<RatingKinerja[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((ratingKinerja: { [key: string]: any; }) => new RatingKinerja(ratingKinerja));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<RatingKinerja> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new RatingKinerja(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
