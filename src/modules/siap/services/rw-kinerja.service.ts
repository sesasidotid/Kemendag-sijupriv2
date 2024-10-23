import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { catchError, map, Observable } from 'rxjs';
import { RWKinerja } from '../models/rw-kinerja.model';
import { ObjectTask } from '../../workflow/models/object-task.model';
import { Task } from '../../workflow/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class RwKinerjaService {
  readonly BASE_PATH = '/api/v1/rw_kinerja'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<RWKinerja[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((kinerja: { [key: string]: any; }) => new RWKinerja(kinerja));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByNip(id: string): Observable<RWKinerja> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new RWKinerja(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  detailObject(object_task_id: string): Observable<ObjectTask> {
    return this.apiService.getData(`${this.BASE_PATH}/task/${object_task_id}`).pipe(
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

  saveTask(user: RWKinerja): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}/task`, user).pipe(
      catchError((error) => {
        console.error('Error save RWKinerja', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  updateTask(user: RWKinerja): Observable<void> {
    return this.apiService.putData(`${this.BASE_PATH}/task`, user).pipe(
      catchError((error) => {
        console.error('Error update RWKinerja', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  submitTask(task: Task): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}/task/submit`, task).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
