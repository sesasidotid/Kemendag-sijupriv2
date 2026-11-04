import { ApiService } from '@/modules/base/services/api.service'
import { Injectable } from '@angular/core'
import { BehaviorSubject, catchError, finalize, map, of } from 'rxjs'
import { PendingTask } from '../models/ukom-registration-refactored/pending-task.model'
import { HandlerService } from '@/modules/base/services/handler.service'

@Injectable({
    providedIn: 'root',
})
export class UkomPendingTaskService {
    readonly BASE_PATH = '/api/v1/pending_task'

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    private pendingTaskDetailSubject = new BehaviorSubject<PendingTask>(null)
    pendingTaskDetail$ = this.pendingTaskDetailSubject.asObservable()
    private pendingTaskDetailLoadingSubject = new BehaviorSubject<boolean>(
        false,
    )
    isPendingTaskDetailLoading$ =
        this.pendingTaskDetailLoadingSubject.asObservable()

    findById(id: string) {
        this.pendingTaskDetailLoadingSubject.next(true)

        this.apiService
            .getData(`${this.BASE_PATH}/${id}`)
            .pipe(
                map((data) => new PendingTask(data)),
                catchError((error) => {
                    this.handlerService.handleException(error)
                    return of(new PendingTask())
                }),
                finalize(() =>
                    this.pendingTaskDetailLoadingSubject.next(false),
                ),
            )
            .subscribe((pendingTask) => {
                this.pendingTaskDetailSubject.next(pendingTask)
            })
    }
}
