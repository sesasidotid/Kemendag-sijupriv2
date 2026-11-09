import { Component, Input } from '@angular/core'
import { AdminRwPendidikanPendingComponent } from './admin-rw-pendidikan-pending/admin-rw-pendidikan-pending.component'
import { AdminRwPendidikanListComponent } from './admin-rw-pendidikan-list/admin-rw-pendidikan-list.component'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-admin-rw-pendidikan',
    standalone: true,
    imports: [
        CommonModule,
        AdminRwPendidikanListComponent,
        AdminRwPendidikanPendingComponent,
    ],
    templateUrl: './admin-rw-pendidikan.component.html',
    styleUrl: './admin-rw-pendidikan.component.scss',
})
export class AdminRwPendidikanComponent {
    @Input() nip?: string = ''
    activeSubTab: 'sekarang' | 'pending' = 'sekarang'

    changeSubTab(tab: 'sekarang' | 'pending') {
        this.activeSubTab = tab
    }
}
