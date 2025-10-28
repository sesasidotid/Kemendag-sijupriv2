import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-loading-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loading-button.component.html',
    styleUrls: ['./loading-button.component.scss'],
})
export class LoadingButtonComponent {
    @Input() isLoading: boolean = false
    @Input() disabled: boolean = false
    @Input() type: 'button' | 'submit' = 'button'
    @Input() label: string = 'Submit'
    @Input() className: string = 'btn btn-success'
    @Input() icon?: string

    @Output() clicked = new EventEmitter<void>()

    handleClick() {
        if (this.type === 'button') {
            this.clicked.emit()
        }
    }
}
