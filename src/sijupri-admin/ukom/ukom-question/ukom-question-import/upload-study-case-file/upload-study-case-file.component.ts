import {
    Component,
    computed,
    effect,
    inject,
    OnInit,
    output,
    signal,
} from '@angular/core'
import { BidangJabatanService } from '@/modules/maintenance/services/bidang-jabatan.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { ImportQuestionListUpload } from '@/modules/ukom/models/ukom-module-refactor/import-question-request.model'
import {
    EygileFile,
    FIleHandler,
} from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'

@Component({
    selector: 'app-upload-study-case-file',
    standalone: true,
    imports: [FileHandlerComponent],
    templateUrl: './upload-study-case-file.component.html',
    styleUrl: './upload-study-case-file.component.scss',
})
export class UploadStudyCaseFileComponent implements OnInit {
    listUploadChange = output<ImportQuestionListUpload[]>()
    isAllFileUploadedChange = output<boolean>()

    listUploadInputs: FIleHandler = { files: {} }
    uploadedMap = signal<{ [key: string]: ImportQuestionListUpload }>({})
    isAllFilled = computed(() => {
        const bidangList = this.bidangJabatanList()
        const uploaded = this.uploadedMap()

        if (!bidangList?.length) return false

        return bidangList.every((b) => uploaded[b.code]?.filePdf)
    })
    private bidangJabatanService = inject(BidangJabatanService)
    bidangJabatanList = toSignal(this.bidangJabatanService.bidangJabatanList$, {
        initialValue: [],
    })
    isBidangJabatanLoading = toSignal(
        this.bidangJabatanService.isBidangJabatanListLoading$,
        { initialValue: false },
    )

    constructor() {
        effect(() => {
            const _ = this.bidangJabatanList()
            this.setupFileHandler()
        })

        effect(() => {
            const uploaded = this.uploadedMap()
            const list = Object.values(uploaded)

            this.listUploadChange.emit(list)
        })

        effect(() => {
            this.isAllFileUploadedChange.emit(this.isAllFilled())
        })
    }

    ngOnInit() {
        this.bidangJabatanService.fetchBidangJabatan()
    }

    private setupFileHandler() {
        const bidangList = this.bidangJabatanList()

        if (!bidangList?.length) {
            this.listUploadInputs = { files: {} }
            return
        }

        const files: { [key: string]: EygileFile } = {}

        for (const bidang of bidangList) {
            files[bidang.code] = {
                label: bidang.name,
                required: true,
                id: bidang.code,
            }
        }

        this.listUploadInputs = {
            files,
            allowedExtensions: ['application/pdf'],
            maxSize: 5 * 1024 * 1024, // 5MB
            listen: (
                key: string,
                source: string,
                base64Data: string,
                label: string,
            ) => {
                this.handleFileChange(key, base64Data)
            },
        }
    }

    private handleFileChange(key: string, base64: string) {
        this.uploadedMap.update((current) => ({
            ...current,
            [key]: new ImportQuestionListUpload({
                bidangId: key,
                filePdf: base64,
            }),
        }))
    }
}
