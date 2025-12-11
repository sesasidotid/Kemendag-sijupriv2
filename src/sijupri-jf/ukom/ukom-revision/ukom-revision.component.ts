import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { JF } from '../../../modules/siap/models/jf.model'
import { CommonModule } from '@angular/common'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { DokumenUkomPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan-ukom'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { BehaviorSubject } from 'rxjs'
import { RevisiDokumenUkom } from '../../../modules/ukom/models/revisi-dokumen-ukom.model'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { Task } from '@/modules/workflow/models/task.model'
import { UkomFlowId } from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
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
        private confirmationService: ConfirmationService,
        public ukomParticipantService: UkomParticipantService,
    ) {}

    ngOnInit() {
        this.loadRejectedDokumen()
    }

    loadRejectedDokumen() {
        if (!this.pendingTask?.documentUkomList?.length) return

        this.rejectedDokumen = this.pendingTask.documentUkomList.filter(
            (d) => d.dokumenStatus.toLowerCase() === 'reject',
        )

        this.inputs.files = Object.fromEntries(
            this.rejectedDokumen.map((d) => [
                d.dokumenPersyaratanId,
                {
                    label: d.dokumenPersyaratanName || 'Unknown Document',
                    remark: d.remark,
                },
            ]),
        )
    }

    isAnyFileMissing(): boolean {
        // if there are no rejected docs at all, nothing is missing
        if (!this.rejectedDokumen || this.rejectedDokumen.length === 0) {
            return false
        }

        // if inputs.files is empty while we have rejected docs → missing
        if (!this.inputs.files || Object.keys(this.inputs.files).length === 0) {
            return true
        }

        // otherwise check if any required file has not been detected
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

                const existingDokumen = this.pendingTask.documentUkomList.find(
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
