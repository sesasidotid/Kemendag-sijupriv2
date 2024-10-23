import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { catchError, map, Observable } from 'rxjs';
import { AlertService } from '../../base/services/alert.service';
import { ObjectTask } from '../models/object-task.model';

@Injectable({
  providedIn: 'root'
})
export class ObjectTaskService {
  readonly BASE_PATH = '/api/v1/object_task'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<ObjectTask[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((user: { [key: string]: any; }) => new ObjectTask(user));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<ObjectTask> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new ObjectTask(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
