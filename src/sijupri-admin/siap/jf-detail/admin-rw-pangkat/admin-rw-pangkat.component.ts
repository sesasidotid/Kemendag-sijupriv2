import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { AdminRwPangkatListComponent } from './admin-rw-pangkat-list/admin-rw-pangkat-list.component'
import { AdminRwPangkatPendingComponent } from './admin-rw-pangkat-pending/admin-rw-pangkat-pending.component'
import { LoginContext } from '@/modules/base/commons/login-context'

@Component({
    selector: 'app-admin-rw-pangkat',
    standalone: true,
    imports: [
        CommonModule,
        AdminRwPangkatListComponent,
        AdminRwPangkatPendingComponent,
    ],
    templateUrl: './admin-rw-pangkat.component.html',
    styleUrl: './admin-rw-pangkat.component.scss',
})
export class AdminRwPangkatComponent {
    @Input() nip?: string = ''
    activeSubTab: 'sekarang' | 'pending' = 'sekarang'
    isAdmin: boolean = LoginContext.getRoleCodes().includes('ADMIN')

    changeSubTab(tab: 'sekarang' | 'pending') {
        this.activeSubTab = tab
    }
}
