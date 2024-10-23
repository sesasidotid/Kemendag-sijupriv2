import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { RWPangkat } from '../models/rw-pangkat.model';
import { catchError, map, Observable } from 'rxjs';
import { ObjectTask } from '../../workflow/models/object-task.model';
import { Task } from '../../workflow/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class RwPangkatService {
  readonly BASE_PATH = '/api/v1/rw_pangkat'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<RWPangkat[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((pangkat: { [key: string]: any; }) => new RWPangkat(pangkat));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByNip(id: string): Observable<RWPangkat> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new RWPangkat(response);
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

  saveTask(user: RWPangkat): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}/task`, user).pipe(
      catchError((error) => {
        console.error('Error save RWPangkat', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  updateTask(user: RWPangkat): Observable<void> {
    return this.apiService.putData(`${this.BASE_PATH}/task`, user).pipe(
      catchError((error) => {
        console.error('Error update RWPangkat', error);
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
