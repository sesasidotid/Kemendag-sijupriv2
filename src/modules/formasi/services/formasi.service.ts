import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { Formasi } from '../models/formasi.model';
import { catchError, map, Observable } from 'rxjs';
import { FormasiRequest } from '../models/formasi-request.model';
import { FormasiResult } from '../models/formasi-result.model';
import { Task } from '../../workflow/models/task.model';
import { ObjectTask } from '../../workflow/models/object-task.model';

@Injectable({
  providedIn: 'root'
})
export class FormasiService {
  readonly BASE_PATH = '/api/v1/formasi'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  detailTaskJabatan(unitKerjaId: string, jabatanCode: string): Observable<ObjectTask> {
    return this.apiService.getData(`${this.BASE_PATH}/task/${unitKerjaId}/${jabatanCode}`).pipe(
      map((response: any) => {
        return new ObjectTask(response);
      })
    );
  }

  saveTask(formasiRequest: FormasiRequest): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}/task`, formasiRequest).pipe(
      catchError((error) => {
        console.error('Error save formasi', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  objectTaskAppend(formasiRequest: FormasiRequest): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}/task/append`, formasiRequest).pipe(
      catchError((error) => {
        console.error('Error save formasi', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  calculate(unsurList: any): Observable<FormasiResult[]> {
    return this.apiService.postData(`${this.BASE_PATH}/calculate`, unsurList).pipe(
      map((response: any) => {
        return response.map((formasiUnsur: { [key: string]: any; }) => new FormasiResult(formasiUnsur));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  submit(task: Task): Observable<void> {
    return this.apiService.postData(`${this.BASE_PATH}/task/submit`, task).pipe(
      catchError((error) => {
        console.error('Error submit formasi', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
