import { Injectable } from '@angular/core'
import { ApiService } from '../../base/services/api.service'
import { catchError, map, Observable } from 'rxjs'
import { AlertService } from '../../base/services/alert.service'
import { PendingTask } from '../models/pending-task.model'

@Injectable({
    providedIn: 'root',
})
export class PendingTaskService {
    readonly BASE_PATH = '/api/v1/pending_task'

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
    ) {}

    findById(id: string): Observable<PendingTask> {
        return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
            map((response: any) => {
                return new PendingTask(response)
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                throw error
            }),
        )
    }

    findByWorkflowNameAndObjectId(
        workflowName: string,
        objectId: string,
    ): Observable<PendingTask> {
        return this.apiService
            .getData(`${this.BASE_PATH}/wf_name/${workflowName}/${objectId}`)
            .pipe(
                map((response: any) => {
                    return new PendingTask(response)
                }),
            )
    }

    deletePendingTaskByInstanceId(instanceId: string): Observable<void> {
        return this.apiService.deleteData(`${this.BASE_PATH}/delete/${instanceId}`).pipe(
            catchError((error) => {
                console.error('Error deleting pending task', error)
                throw error
            }),
        )
    }
}
