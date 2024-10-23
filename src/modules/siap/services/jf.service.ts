import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { JF } from '../models/jf.model';
import { catchError, map, Observable } from 'rxjs';
import { JFExpectPending } from '../models/jf-ex-pending.model';
import { PendingTask } from '../../workflow/models/pending-task.model';
import { ObjectTask } from '../../workflow/models/object-task.model';
import { Task } from '../../workflow/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class JfService {
  readonly BASE_PATH = '/api/v1/jf'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<JF[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((jf: { [key: string]: any; }) => new JF(jf));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByNip(id: string): Observable<JF> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new JF(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByNipExpectPending(id: string): Observable<JFExpectPending> {
    return this.apiService.getData(`${this.BASE_PATH}/expect_pending/${id}`).pipe(
      map((response: any) => {
        return new JFExpectPending(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(user: JF): Observable<void> {
    return this.apiService.postData(this.BASE_PATH, user).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  updateTask(user: JF): Observable<void> {
    return this.apiService.putData(`${this.BASE_PATH}/task`, user).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
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

  detailTask(object_group: string): Observable<PendingTask[]> {
    return this.apiService.getData(`${this.BASE_PATH}/task/group/${object_group}`).pipe(
      map((response: any) => {
        return response.map((pendingTask: { [key: string]: any; }) => new PendingTask(pendingTask));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
