import { HandlerService } from '@/modules/base/services/handler.service'
import { ApiService } from '@/modules/base/services/api.service'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { LoginContext } from '@/modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import { Component, DestroyRef, Inject, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { EMPTY, finalize, Observable, tap } from 'rxjs'
import { UkomResignationPendingTask } from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'
import { Participant } from '@/modules/ukom/models/cat/participant.model'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation' // TODO: sesuaikan path asli

interface PendingTaskResponse {
    objectTask?: {
        object?: Record<string, any>
    }
}

@Component({
    selector: 'app-ukom-resignation-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ukom-resignation-detail.component.html',
    styleUrl: './ukom-resignation-detail.component.scss',
})
export class UkomResignationDetailComponent implements OnChanges {
    @Input() participant: Participant | null = null
    @Input() pendingTask: UkomResignationPendingTask | null = null

    filePreviewService = inject(FilePreviewService)
    resignationData: ParticipantResignation | null = null

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['pendingTask']) {
            const object = this.pendingTask?.objectTask?.object

            this.resignationData = object
                ? new ParticipantResignation(object)
                : null
        }
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }
}