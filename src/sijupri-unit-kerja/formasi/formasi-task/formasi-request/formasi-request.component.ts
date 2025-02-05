import { Component, Input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PengaturanFormasiJabatan } from '../../../../modules/formasi/models/formasi-pengaturan-jabatan.model'
import { CommonModule } from '@angular/common'
import {
  LucideAngularModule,
  BookOpenText,
  FileText,
  SquareActivity,
  ScrollText,
  BookUser,
  UserRoundCog,
  Database
} from 'lucide-angular'

@Component({
  selector: 'app-formasi-request',
  standalone: true,
  imports: [RouterLink, CommonModule, LucideAngularModule],
  templateUrl: './formasi-request.component.html',
  styleUrl: './formasi-request.component.scss'
})
export class FormasiRequestComponent {
  @Input() objectTaskId: string
  @Input() PengaturanFormasiJabatan: PengaturanFormasiJabatan[] = []

  constructor () {}
  readonly Icon = BookUser

  //jika ketemu, return true, jika tidak ketemu return false
  isSubmitted (jabatanCode: string) {
    return this.PengaturanFormasiJabatan.some(
      jabatan => jabatan.jabatanCode === jabatanCode
    )
  }
}
