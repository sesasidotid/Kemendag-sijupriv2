import {
    Component,
    computed,
    effect,
    inject,
    input,
    OnInit,
    output,
    signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { toSignal } from '@angular/core/rxjs-interop'

import { BidangJabatanService } from '@/modules/maintenance/services/bidang-jabatan.service'
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { KompetensiService } from '@/modules/maintenance/services/kompetensi.service'
import { IndikatorService } from '@/modules/maintenance/services/indikator.service'

import { ImportQuestionListUpload } from '@/modules/ukom/models/ukom-module-refactor/import-question-request.model'
import {
    EygileFile,
    FIleHandler,
} from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import {
    MultiSelectComponent,
    MultiSelectOption,
} from '@/modules/base/components/multi-select/multi-select.component'
import { KompetensiUkomSearchQueryParams } from '@/modules/ukom/models/kompetensi'
import { IndikatorKompetensiQueryParams } from '@/modules/ukom/models/indikator-kompetensi'

@Component({
    selector: 'app-upload-study-case-file',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        MultiSelectComponent,
    ],
    templateUrl: './upload-study-case-file.component.html',
    styleUrl: './upload-study-case-file.component.scss',
})
export class UploadStudyCaseFileComponent implements OnInit {
    listUploadChange = output<ImportQuestionListUpload[]>()
    isAllFileUploadedChange = output<boolean>()
    reset = input<boolean>(false)
    // Selections
    selectedJabatan = signal<string | null>(null)
    selectedJenjang = signal<string | null>(null)
    selectedBidang = signal<string | null>(null)
    selectedKompetensi = signal<string | null>(null)
    // Dynamic Lists based on selections
    bidangList = signal<{ code: string; name: string }[]>([])
    kompetensiList = signal<any[]>([])
    indikatorList = signal<MultiSelectOption[]>([])
    // Indikator Multi-Select Model
    currentIndikatorSelection = signal<(string | number)[]>([])
    // Merged Selections state
    selectedIndikatorMap = signal<
        Record<string, { indikatorId: string; label: string; code: string }>
    >({})
    // Upload state: Key = indikatorId, Value = ImportQuestionListUpload
    uploadedMap = signal<Record<string, ImportQuestionListUpload>>({})
    // Derived signal for inputs
    listUploadInputs = computed<FIleHandler>(() => {
        const indikatorMap = this.selectedIndikatorMap()
        const files: Record<string, EygileFile> = {}

        for (const indikatorId of Object.keys(indikatorMap)) {
            const indikator = indikatorMap[indikatorId]
            files[indikatorId] = {
                label: indikator.label,
                required: true,
                id: indikatorId,
            }
        }

        return {
            files,
            allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
            maxSize: 5 * 1024 * 1024,
            listen: (key: string, _: any, base64Data: string) => {
                this.handleFileChange(key, base64Data)
            },
        }
    })
    isAllFilled = computed(() => {
        const indikatorMap = this.selectedIndikatorMap()
        const uploaded = this.uploadedMap()

        const indikatorIds = Object.keys(indikatorMap)
        if (!indikatorIds.length) return false

        return indikatorIds.every((id) => uploaded[id]?.file)
    })
    // Services
    private jabatanService = inject(JabatanService)
    // Global lists
    jabatanList = toSignal(this.jabatanService.jabatanList$, {
        initialValue: [],
    })
    private jenjangService = inject(JenjangService)
    jenjangList = toSignal(this.jenjangService.jenjangList$, {
        initialValue: [],
    })
    private bidangJabatanService = inject(BidangJabatanService)
    private kompetensiService = inject(KompetensiService)
    private indikatorService = inject(IndikatorService)

    constructor() {
        effect(() => {
            if (this.reset()) {
                this.resetState()
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
        this.jabatanService.fetchJabatan()
        this.jenjangService.fetchJenjang()
    }

    resetState() {
        this.selectedJabatan.set(null)
        this.selectedJenjang.set(null)
        this.selectedBidang.set(null)
        this.selectedKompetensi.set(null)

        this.bidangList.set([])
        this.kompetensiList.set([])
        this.indikatorList.set([])

        this.currentIndikatorSelection.set([])
        this.selectedIndikatorMap.set({})
        this.uploadedMap.set({})
    }

    onJabatanChange() {
        this.selectedJenjang.set(null)
        this.selectedBidang.set(null)
        this.selectedKompetensi.set(null)
        this.currentIndikatorSelection.set([])
        this.bidangList.set([])
        this.kompetensiList.set([])
        this.indikatorList.set([])

        const jabatanId = this.selectedJabatan()
        if (jabatanId) {
            this.bidangJabatanService
                .findByJabatanCode(jabatanId)
                .subscribe((res) => {
                    this.bidangList.set(res || [])
                })
        }
    }

    onJenjangChange() {
        this.selectedBidang.set(null)
        this.selectedKompetensi.set(null)
        this.currentIndikatorSelection.set([])
        this.kompetensiList.set([])
        this.indikatorList.set([])
        // Can directly fetch kompetensi if bidang is skipped
        this.fetchKompetensi()
    }

    onBidangChange() {
        this.selectedKompetensi.set(null)
        this.currentIndikatorSelection.set([])
        this.kompetensiList.set([])
        this.indikatorList.set([])
        this.fetchKompetensi()
    }

    onKompetensiChange() {
        this.currentIndikatorSelection.set([])
        this.indikatorList.set([])

        const comp = this.selectedKompetensi()
        if (!comp) return

        const params = new IndikatorKompetensiQueryParams({
            eq_kompetensiId: comp,
        })

        const jabCode = this.selectedJabatan()
        const jenjangCode = this.selectedJenjang()
        const bidangCode = this.selectedBidang()

        const jabName =
            this.jabatanList()?.find((j) => j.code === jabCode)?.name || ''
        const jenjangName =
            this.jenjangList()?.find((j) => j.code === jenjangCode)?.name || ''
        const bidangName =
            this.bidangList().find((b) => b.code === bidangCode)?.name || ''

        const compCode =
            this.kompetensiList().find((c) => c.id === comp)?.code || ''

        const details = [compCode, jabName, jenjangName, bidangName]
            .filter(Boolean)
            .join(' - ')

        this.indikatorService.searchAll(params).subscribe((res) => {
            const options: MultiSelectOption[] = (res.data || []).map(
                (ind) => ({
                    id: ind.id,
                    label: `${ind.name} (${details})`,
                    code: ind.code,
                }),
            )
            this.indikatorList.set(options)
        })
    }

    addIndikators() {
        const selections = this.currentIndikatorSelection()
        const options = this.indikatorList()
        const currentMap = { ...this.selectedIndikatorMap() }

        let added = false
        selections.forEach((selId) => {
            const sid = String(selId)
            if (!currentMap[sid]) {
                const opt = options.find((o) => o.id === selId)
                if (opt) {
                    currentMap[sid] = {
                        indikatorId: sid,
                        label: opt.label,
                        code: opt['code'],
                    }
                    added = true
                }
            }
        })

        if (added) {
            this.selectedIndikatorMap.set(currentMap)
        }

        // Reset selections so user can pick new things
        this.currentIndikatorSelection.set([])
    }

    removeIndikator(indikatorId: string) {
        const currentMap = { ...this.selectedIndikatorMap() }
        delete currentMap[indikatorId]
        this.selectedIndikatorMap.set(currentMap)

        // Don't modify uploaded map instantly, just let it exist or clean up
        // Based on instructions: Preserve uploaded file if indikator remains selected.
        // It doesn't say clear it if removed, but we can clean it to avoid memory leaks.
        this.uploadedMap.update((uploads) => {
            const newUploads = { ...uploads }
            delete newUploads[indikatorId]
            return newUploads
        })
    }

    private fetchKompetensi() {
        const jab = this.selectedJabatan()
        const jen = this.selectedJenjang()
        const bid = this.selectedBidang()

        if (!jab || !jen) return

        const params = new KompetensiUkomSearchQueryParams({
            eq_jabatanCode: jab,
            eq_jenjangCode: jen,
            ...(bid && { eq_bidangJabatanCode: bid }),
        })

        console.log(params)
        this.kompetensiService.searchAll(params).subscribe((res) => {
            this.kompetensiList.set(res.data || [])
        })
    }

    private handleFileChange(key: string, base64: string) {
        const indikator = this.selectedIndikatorMap()[key]

        if (!indikator) return

        this.uploadedMap.update((current) => ({
            ...current,
            [key]: new ImportQuestionListUpload({
                code: indikator.code,
                file: base64,
            }),
        }))
    }
}
