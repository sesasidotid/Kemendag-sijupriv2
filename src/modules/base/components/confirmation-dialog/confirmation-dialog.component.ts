import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from '../../services/confirmation.service'

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  isVisible = false
  isCommentEnabled = false
  comment: string = ''

  constructor (private confirmationDialogService: ConfirmationService) {}

  ngOnInit () {
    // Register the component with the service so it can be controlled by the service
    this.confirmationDialogService.setConfirmationDialogComponent(this)
  }

  open (withComment: boolean = false) {
    this.isVisible = true
    this.isCommentEnabled = withComment
  }

  close (result: boolean) {
    this.isVisible = false
    if (this.isCommentEnabled && result) {
      this.confirmationDialogService.confirm(true, this.comment)
    } else {
      this.confirmationDialogService.confirm(result)
    }
    this.comment = ''
  }
}
