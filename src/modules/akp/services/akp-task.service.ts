import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { HandlerService } from '../../base/services/handler.service';
import { AlertService } from '../../base/services/alert.service';
import { catchError, map, Observable } from 'rxjs';
import { AKPTask } from '../models/akp-task.model';
import { AKPByReviewer } from '../models/akp-by-reviewer.model';

@Injectable({
  providedIn: 'root'
})
export class AkpTaskService {
  readonly BASE_PATH_TASK = '/api/v1/akp/task'
  readonly BASE_PATH_AKP = '/api/v1/akp'

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private alertService: AlertService
  ) { }

  findByNip(id: string): Observable<AKPTask> {
    return this.apiService.getData(`${this.BASE_PATH_TASK}/${id}`).pipe(
      map((response: any) => {
        return new AKPTask(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        throw error;
      })
    );
  }

  saveTask(id: string): Observable<any> {
    return this.apiService.postData(`${this.BASE_PATH_TASK}`, {nip: id}).pipe(
      catchError((error) => {
        console.error('error', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  getAKPByReviewer(id: string, whoIs: string): Observable<AKPByReviewer> {
    return this.apiService.getData(`${this.BASE_PATH_AKP}/reviewer/${whoIs}/${id}`).pipe(
      map((response: any) => {
        return new AKPByReviewer(response);
      }),
      catchError((error) => {
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  saveAKPReviewByBoss(review: any): Observable<any> {
    return this.apiService.postData(`${this.BASE_PATH_AKP}/matrix/atasan`, review).pipe(
      catchError((error) => {
        console.error('error', error);
        this.alertService.showToast('Error', error.error.message);
        throw error;
      })
    );
  }
  saveAKPReviewByColleague(review: any): Observable<any> {
    return this.apiService.postData(`${this.BASE_PATH_AKP}/matrix/rekan`, review).pipe(
      catchError((error) => {
        console.error('error', error);
        this.alertService.showToast('Error', error.error.message);
        throw error;
      })
    );
  }
}
