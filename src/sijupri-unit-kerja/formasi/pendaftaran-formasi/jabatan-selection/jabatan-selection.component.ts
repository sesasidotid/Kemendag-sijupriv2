import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'

@Component({
    selector: 'app-jabatan-selection',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FileHandlerComponent],
    templateUrl: './jabatan-selection.component.html',
})
export class JabatanSelectionComponent {
    fb = new FormBuilder()

    jabatanList = DUMMY_JABATAN

    expandedJabatanCode = signal<string | null>(null)

    // one matrix per jabatan
    matrices = new Map<
        string,
        {
            config: any
            form: FormGroup
            status: 'diusulkan' | 'tidak_diusulkan' | null
            fileHandler: FIleHandler
        }
    >()

    toggleJabatan(code: string) {
        if (!this.matrices.has(code)) {
            const config = this.jabatanList.find((j) => j.code === code)!
            this.matrices.set(code, {
                config,
                form: this.buildForm(config),
                status: null,
                fileHandler: this.createFileHandler(code),
            })
        }

        this.expandedJabatanCode.set(
            this.expandedJabatanCode() === code ? null : code,
        )
    }

    isExpanded(code: string) {
        return this.expandedJabatanCode() === code
    }

    setStatus(code: string, status: 'diusulkan' | 'tidak_diusulkan') {
        const matrix = this.matrices.get(code)
        if (matrix) {
            matrix.status = status
            // Reset form when status changes
            if (status === 'diusulkan') {
                // Clear dokumen if switching to diusulkan
                const form = matrix.form
                form.patchValue({ dokumen: null })
            } else {
                // Clear rows if switching to tidak_diusulkan
                const form = matrix.form
                const rows = form.get('rows') as FormArray
                rows.clear()
                matrix.config.ruangLingkup.forEach(() => {
                    rows.push(
                        this.fb.group({
                            volume: this.fb.group(
                                Object.fromEntries(
                                    matrix.config.jenjang.map((j: any) => [
                                        j,
                                        0,
                                    ]),
                                ),
                            ),
                        }),
                    )
                })
            }
        }
    }

    getStatus(code: string): 'diusulkan' | 'tidak_diusulkan' | null {
        return this.matrices.get(code)?.status ?? null
    }

    createFileHandler(code: string): FIleHandler {
        return {
            files: {
                dokumen_pendukung: {
                    label: 'Dokumen Pendukung (Wajib)',
                },
            },
            maxSize: 2 * 1024 * 1024,
            allowedTypes: [{ type: 'application/pdf' }],
            listen: (key: string, source: string, base64Data: string) => {
                const matrix = this.matrices.get(code)
                if (matrix) {
                    matrix.form.patchValue({
                        dokumen: base64Data,
                    })
                }
            },
        }
    }

    buildForm(config: any): FormGroup {
        return this.fb.group({
            diusulkan: [null, Validators.required], // true = diusulkan, false = tidak diusulkan
            rows: this.fb.array(
                config.ruangLingkup.map(() =>
                    this.fb.group({
                        volume: this.fb.group(
                            Object.fromEntries(
                                config.jenjang.map((j: any) => [j, 0]),
                            ),
                        ),
                    }),
                ),
            ),
            dokumen: [null], // for file upload when tidak diusulkan
        })
    }

    rowsOf(code: string): FormArray {
        return this.matrices.get(code)!.form.get('rows') as FormArray
    }

    volumeControl(
        code: string,
        rowIndex: number,
        jenjang: string,
    ): FormControl<number> {
        return this.rowsOf(code)
            .at(rowIndex)
            .get(['volume', jenjang]) as FormControl<number>
    }

    onVolumeKeydown(
        event: KeyboardEvent,
        code: string,
        rowIndex: number,
        jenjangIndex: number,
    ) {
        if (event.key === 'Enter') {
            event.preventDefault()
            const matrix = this.matrices.get(code)
            if (!matrix) return

            const rows = this.rowsOf(code)

            // Move to next row, same jenjang
            if (rowIndex < rows.length - 1) {
                const nextInput = document.querySelector(
                    `input[data-row="${rowIndex + 1}"][data-jenjang="${jenjangIndex}"]`,
                ) as HTMLInputElement
                if (nextInput) {
                    nextInput.focus()
                    nextInput.select()
                }
            }
        }
    }

    getFileHandler(code: string): FIleHandler | undefined {
        return this.matrices.get(code)?.fileHandler
    }
}

type JenjangKey = string

interface RuangLingkup {
    id: string
    name: string
    definisi: string
}

interface JabatanConfig {
    code: string
    name: string
    jenjang: JenjangKey[]
    ruangLingkup: RuangLingkup[]
}

const DUMMY_JABATAN: JabatanConfig[] = [
    {
        code: 'NEGOS',
        name: 'Negosiator Perdagangan',
        jenjang: ['pertama', 'muda', 'madya', 'utama'],
        ruangLingkup: [
            {
                id: '1',
                name: 'Hasil Kerja Sama',
                definisi:
                    'Jumlah kerja sama perdagangan internasional yang diselesaikan dalam 1 tahun.',
            },
            {
                id: '2',
                name: 'Hasil Perundingan',
                definisi:
                    'Jumlah perundingan yang diselesaikan dan dituangkan dalam laporan.',
            },
        ],
    },
    {
        code: 'PMB',
        name: 'Penguji Mutu Barang',
        jenjang: ['pemula', 'terampil', 'mahir', 'penyelia'],
        ruangLingkup: [
            {
                id: '1',
                name: 'Pengujian Mutu',
                definisi:
                    'Jumlah kegiatan pengujian mutu barang sesuai standar.',
            },
            {
                id: '2',
                name: 'Pengawasan Mutu',
                definisi: 'Jumlah kegiatan pengawasan mutu barang.',
            },
        ],
    },
]
