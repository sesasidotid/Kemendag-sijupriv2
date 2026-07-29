import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { AdminRwJabatanListComponent } from './admin-rw-jabatan-list/admin-rw-jabatan-list.component'
import { AdminRwJabatanPendingComponent } from './admin-rw-jabatan-pending/admin-rw-jabatan-pending.component'
import { LoginContext } from '@/modules/base/commons/login-context'

@Component({
    selector: 'app-admin-rw-jabatan',
    standalone: true,
    imports: [
        CommonModule,
        AdminRwJabatanListComponent,
        AdminRwJabatanPendingComponent,
    ],
    templateUrl: './admin-rw-jabatan.component.html',
    styleUrl: './admin-rw-jabatan.component.scss',
})
export class AdminRwJabatanComponent {
    @Input() nip?: string = ''
    activeSubTab: 'sekarang' | 'pending' = 'sekarang'
    isAdmin: boolean = LoginContext.getRoleCodes().includes('ADMIN')

    changeSubTab(tab: 'sekarang' | 'pending') {
        this.activeSubTab = tab
    }
}
