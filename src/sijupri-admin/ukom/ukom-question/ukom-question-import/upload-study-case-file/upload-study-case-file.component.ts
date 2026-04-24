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
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'

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

    uploadedMap = signal<Record<string, ImportQuestionListUpload>>({})
    private bidangJabatanService = inject(BidangJabatanService)
    bidangJabatanList = toSignal(this.bidangJabatanService.bidangJabatanList$, {
        initialValue: [],
    })
    isAllFilled = computed(() => {
        const bidangList = this.bidangJabatanList()
        const uploaded = this.uploadedMap()

        if (!bidangList.length) return false

        return bidangList.every((b) => uploaded[b.code]?.filePdf)
    })
    jabatanMap = computed<Record<string, string>>(() => {
        const bidangList = this.bidangJabatanList()
        const jabatanLookup = this.jabatanLookup()

        return bidangList.reduce(
            (acc, bidang) => {
                const jabatanName = jabatanLookup[bidang.jabatanCode] ?? '-'
                acc[bidang.code] = `${jabatanName} - ${bidang.name}`
                return acc
            },
            {} as Record<string, string>,
        )
    })
    isBidangJabatanLoading = toSignal(
        this.bidangJabatanService.isBidangJabatanListLoading$,
        { initialValue: false },
    )
    private jabatanService = inject(JabatanService)
    jabatanList = toSignal(this.jabatanService.jabatanList$, {
        initialValue: [],
    })
    jabatanLookup = computed<Record<string, string>>(() => {
        const list = this.jabatanList()

        return list.reduce(
            (acc, item) => {
                acc[item.code] = item.name
                return acc
            },
            {} as Record<string, string>,
        )
    })

    constructor() {
        effect(() => {
            const bidangList = this.bidangJabatanList()
            const jabatanMap = this.jabatanMap()

            if (!bidangList.length) {
                this.listUploadInputs = { files: {} }
                return
            }

            const files: Record<string, EygileFile> = {}

            for (const bidang of bidangList) {
                files[bidang.code] = {
                    label: jabatanMap[bidang.code],
                    required: true,
                    id: bidang.code,
                }
            }

            this.listUploadInputs = {
                files,
                allowedExtensions: ['application/pdf'],
                maxSize: 5 * 1024 * 1024,
                listen: (key: string, _: any, base64Data: string) => {
                    this.handleFileChange(key, base64Data)
                },
            }
        })

        effect(() => {
            const uploaded = this.uploadedMap()
            this.listUploadChange.emit(Object.values(uploaded))
        })

        effect(() => {
            this.isAllFileUploadedChange.emit(this.isAllFilled())
        })
    }

    ngOnInit() {
        this.bidangJabatanService.fetchBidangJabatan()
        this.jabatanService.fetchJabatan()
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
