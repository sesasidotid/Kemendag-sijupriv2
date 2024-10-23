import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { catchError, map, Observable } from 'rxjs';
import { RWSertifikasi } from '../models/rw-sertifikasi.model';
import { ObjectTask } from '../../workflow/models/object-task.model';
import { Task } from '../../workflow/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class RwSertifikasiService {
  readonly BASE_PATH = '/api/v1/rw_sertifikasi'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<RWSertifikasi[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((sertifikasi: { [key: string]: any; }) => new RWSertifikasi(sertifikasi));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByNip(id: string): Observable<RWSertifikasi> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new RWSertifikasi(response);
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

  saveTask(user: RWSertifikasi): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}/task`, user).pipe(
      catchError((error) => {
        console.error('Error save RWSertifikasi', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  updateTask(user: RWSertifikasi): Observable<void> {
    return this.apiService.putData(`${this.BASE_PATH}/task`, user).pipe(
      catchError((error) => {
        console.error('Error update RWSertifikasi', error);
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
