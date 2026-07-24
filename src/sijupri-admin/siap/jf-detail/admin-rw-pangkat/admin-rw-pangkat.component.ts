import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { AdminRwPangkatListComponent } from './admin-rw-pangkat-list/admin-rw-pangkat-list.component'

@Component({
    selector: 'app-admin-rw-pangkat',
    standalone: true,
    imports: [CommonModule, AdminRwPangkatListComponent],
    templateUrl: './admin-rw-pangkat.component.html',
    styleUrl: './admin-rw-pangkat.component.scss',
})
export class AdminRwPangkatComponent {
    @Input() nip?: string = ''
    activeSubTab: 'sekarang' | 'pending' = 'sekarang'

    changeSubTab(tab: 'sekarang' | 'pending') {
        this.activeSubTab = tab
    }
}
