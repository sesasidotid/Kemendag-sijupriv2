import { Component } from '@angular/core'
import { Input } from '@angular/core'
import { RoomUkomDetail } from '../../../../modules/ukom/models/room-ukom-detail'
@Component({
  selector: 'app-ukom-class-edit',
  standalone: true,
  imports: [],
  templateUrl: './ukom-class-edit.component.html',
  styleUrl: './ukom-class-edit.component.scss'
})
export class UkomClassEditComponent {
  @Input() RoomUkom: RoomUkomDetail
}
