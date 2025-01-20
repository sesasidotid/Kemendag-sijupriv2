import { Injectable } from '@angular/core'
import { ApiService } from '../../base/services/api.service'
import { HandlerService } from '../../base/services/handler.service'
import { AlertService } from '../../base/services/alert.service'
import { catchError, map, Observable } from 'rxjs'
import { UkomTaskDetail } from '../models/ukom-task-detail.modal'
@Injectable({
  providedIn: 'root'
})
export class UkomTaskService {
  readonly BASE_PATH_TASK = '/api/v1/participant_ukom/task'

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private alertService: AlertService
  ) {}

  findByNip (nip: string): Observable<UkomTaskDetail> {
    return this.apiService.getData(`${this.BASE_PATH_TASK}/nip/${nip}`).pipe(
      catchError(error => {
        console.error('Error fetching data', error)
        throw error
      })
    )
  }
}
