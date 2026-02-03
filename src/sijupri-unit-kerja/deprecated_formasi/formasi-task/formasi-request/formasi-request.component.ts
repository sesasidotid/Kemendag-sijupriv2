import { Component, Input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PengaturanFormasiJabatan } from '../../../../modules/formasi/models/formasi-pengaturan-jabatan.model'
import { CommonModule } from '@angular/common'
import { BookUser, LucideAngularModule } from 'lucide-angular'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'

@Component({
    selector: 'app-formasi-request',
    standalone: true,
    imports: [RouterLink, CommonModule, LucideAngularModule],
    templateUrl: './formasi-request.component.html',
    styleUrl: './formasi-request.component.scss',
})
export class FormasiRequestComponent {
    @Input() objectTaskId: string
    @Input() PengaturanFormasiJabatan: PengaturanFormasiJabatan[] = []

    jabatanList: Jabatan[] = []
    readonly Icon = BookUser

    constructor(private apiService: ApiService) {}

    ngOnInit() {
        this.getAvaibleJabatanForFormasi()
    }

    getAvaibleJabatanForFormasi() {
        this.apiService
            .getData(`/api/v1/formasi_detail/jabatan_list`)
            .subscribe({
                next: (res) => {
                    this.jabatanList = res
                },
            })
    }
    //jika ketemu, return true, jika tidak ketemu return false
    isSubmitted(jabatanCode: string) {
        return this.PengaturanFormasiJabatan.some(
            (jabatan) => jabatan.jabatanCode == jabatanCode,
        )
    }
}
