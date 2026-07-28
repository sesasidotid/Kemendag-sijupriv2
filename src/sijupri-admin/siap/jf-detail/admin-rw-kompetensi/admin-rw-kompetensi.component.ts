import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { AdminRwKompetensiListComponent } from './admin-rw-kompetensi-list/admin-rw-kompetensi-list.component'
import { AdminRwKompetensiPendingComponent } from './admin-rw-kompetensi-pending/admin-rw-kompetensi-pending.component'

@Component({
    selector: 'app-admin-rw-kompetensi',
    standalone: true,
    imports: [
        CommonModule,
        AdminRwKompetensiListComponent,
        AdminRwKompetensiPendingComponent,
    ],
    templateUrl: './admin-rw-kompetensi.component.html',
    styleUrl: './admin-rw-kompetensi.component.scss',
})
export class AdminRwKompetensiComponent {
    @Input() nip?: string = ''
    activeSubTab: 'sekarang' | 'pending' = 'sekarang'

    changeSubTab(tab: 'sekarang' | 'pending') {
        this.activeSubTab = tab
    }
}
