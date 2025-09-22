import { DokumenUkomList } from '../../../modules/ukom/models/ukom-task-detail.modal'
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { JF } from '../../../modules/siap/models/jf.model'
import { CommonModule } from '@angular/common'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { Jabatan } from '../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { DokumenUkomPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan-ukom'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { BehaviorSubject, switchMap, finalize } from 'rxjs'
import { RevisiDokumenUkom } from '../../../modules/ukom/models/revisi-dokumen-ukom.model'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { Task } from '@/modules/workflow/models/task.model'
import { UkomFlowId } from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'
import { Router } from '@angular/router'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { PendingTask } from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'
@Component({
    selector: 'app-ukom-revision',
    standalone: true,
    imports: [CommonModule, FileHandlerComponent, LoadingButtonComponent],
    templateUrl: './ukom-revision.component.html',
    styleUrl: './ukom-revision.component.scss',
})
export class UkomRevisionComponent {
    @Input() jf = new JF()
    @Input() ukom = new Ukom()
    @Input() pendingTask = new UkomTaskDetail()
    @Output() submitted = new EventEmitter<void>()

    pesertaUkom = new PesertaUkom()
    revisedDokumen = new RevisiDokumenUkom()

    detectedDokumen: Record<
        string,
        {
            base64: string
            label: string
        }
    > = {}
    dokumenPersyaratanList: DokumenUkomPersyaratan[] = []
    rejectedDokumen: any[] = []

    inputs: FIleHandler = {
        files: {},
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
        ) => {
            console.log({ key, source, base64Data, label })
            this.detectedDokumen[key] = {
                base64: base64Data,
                label: label,
            }
        },
    }

    submitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        public ukomParticipantService: UkomParticipantService,
    ) {}

    ngOnInit() {
        this.getRejectedDokumen()
        this.handleRejectedDokumen()
    }

    getRejectedDokumen() {
        if (this.pendingTask?.dokumenUkomList?.length) {
            this.rejectedDokumen = this.pendingTask.dokumenUkomList.filter(
                (dokumen) => dokumen.dokumenStatus.toLowerCase() === 'reject',
            )
        }
    }

    handleRejectedDokumen() {
        this.inputs.files = {}
        this.rejectedDokumen.forEach((dokumen, index) => {
            const key = dokumen.dokumenPersyaratanId
            this.inputs.files[key] = {
                label: dokumen.dokumenPersyaratanName || 'Unknown Document',
                remark: dokumen.remark,
            }
        })
    }

    isAnyFileMissing(): boolean {
        if (!this.inputs.files || Object.keys(this.inputs.files).length === 0) {
            return true
        }

        return Object.keys(this.inputs.files).some((key) => {
            return !this.detectedDokumen[key]
        })
    }

    onSave() {
        if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
            this.pesertaUkom.dokumenUkomList = []
        }

        const documentMap = new Map()

        for (const key in this.detectedDokumen) {
            if (this.detectedDokumen.hasOwnProperty(key)) {
                const detected = this.detectedDokumen[key]

                const existingDokumen = this.pendingTask.dokumenUkomList.find(
                    (dokumen) => dokumen.dokumenPersyaratanId === key,
                )

                if (existingDokumen) {
                    const newDoc = {
                        dokumenFile: detected.base64,
                        dokumenPersyaratanName: `${
                            this.jf.nip
                        }_dokumenPersyaratanUkom_${Date.now()}_${
                            existingDokumen.dokumenPersyaratanName
                        }`,
                        dokumenPersyaratanId:
                            existingDokumen.dokumenPersyaratanId,
                    }

                    documentMap.set(
                        existingDokumen.dokumenPersyaratanId,
                        newDoc,
                    )
                }
            }
        }

        this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                const payload = new Task({
                    id: this.pendingTask.id,
                    taskAction: UkomFlowId.UkomFlowId1,
                    object: this.pesertaUkom,
                })
                this.ukomParticipantService.submitUkomTask(payload, () => {
                    this.submitted.emit()
                })
            },
        })
    }
}
