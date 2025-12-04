import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './empty-state.component.html',
    styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
    @Input() title: string = 'Tidak ada data'
    @Input() description: string =
        'Kamu bisa menambahkan data dengan menekan tombol dibawah ini.'
    @Input() buttonText: string
    @Input() buttonAction: () => void = () => {}
    @Input() buttonIcon: string
    @Input() icon: string = 'mdi-folder-open-outline'
    @Input() iconColor: string = 'primary'

    constructor() {}

    handleButtonClick() {
        if (this.buttonAction) {
            this.buttonAction()
        }
    }
}
