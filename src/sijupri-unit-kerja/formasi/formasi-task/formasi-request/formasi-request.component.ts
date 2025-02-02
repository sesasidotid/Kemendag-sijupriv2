import { Component, Input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PengaturanFormasiJabatan } from '../../../../modules/formasi/models/formasi-pengaturan-jabatan.model'
import { CommonModule } from '@angular/common'
@Component({
  selector: 'app-formasi-request',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './formasi-request.component.html',
  styleUrl: './formasi-request.component.scss'
})
export class FormasiRequestComponent {
  @Input() objectTaskId: string
  @Input() PengaturanFormasiJabatan: PengaturanFormasiJabatan[] = []

  constructor () {}

  //jika ketemu, return true, jika tidak ketemu return false
  isSubmitted (jabatanCode: string) {
    return this.PengaturanFormasiJabatan.some(
      jabatan => jabatan.jabatanCode === jabatanCode
    )
  }
}
