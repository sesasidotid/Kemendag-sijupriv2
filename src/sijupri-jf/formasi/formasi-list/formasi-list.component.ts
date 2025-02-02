import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'

@Component({
  selector: 'app-formasi-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './formasi-list.component.html',
  styleUrl: './formasi-list.component.scss'
})
export class FormasiListComponent {
  columns: any = [
    { property: 'nip', header: 'NIP' },
    { property: 'user|name', header: 'Nama' },
    { property: 'user|email', header: 'Email' },
    { url: { detail: '/' }, header: 'Action' }
  ]
  filters: any = [
    { lable: 'NIP', type: 'text', key: 'like_nip' },
    { lable: 'Nama', type: 'text', key: 'like_user|name' },
    { lable: 'Email', type: 'text', key: 'like_user|email' }
  ]
}
