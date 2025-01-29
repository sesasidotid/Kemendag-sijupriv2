import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  imports: [CommonModule]
})
export class ModalComponent {
  @Input() title: string = ''
  @Input() enableFooter: boolean = true
  @Output() toggle = new EventEmitter<void>()
  @Output() saveEvent = new EventEmitter<void>()
  @Input() size: 'sm' | 'md' | 'lg' = 'sm'

  toggleModal () {
    this.toggle.emit()
  }

  save () {
    this.saveEvent.emit()
  }
}
