import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { AdminRwKinerjaPendingComponent } from './admin-rw-kinerja-pending/admin-rw-kinerja-pending.component'
import { AdminRwKinerjaListComponent } from './admin-rw-kinerja-list/admin-rw-kinerja-list.component'

@Component({
    selector: 'app-admin-rw-kinerja',
    standalone: true,
    imports: [
        CommonModule,
        AdminRwKinerjaListComponent,
        AdminRwKinerjaPendingComponent,
    ],
    templateUrl: './admin-rw-kinerja.component.html',
    styleUrl: './admin-rw-kinerja.component.scss',
})
export class AdminRwKinerjaComponent {
    @Input() nip?: string = ''
    activeSubTab: 'sekarang' | 'pending' = 'sekarang'

    changeSubTab(tab: 'sekarang' | 'pending') {
        this.activeSubTab = tab
    }
}
