import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { AdminRwSertifikasiListComponent } from './admin-rw-sertifikasi-list/admin-rw-sertifikasi-list.component'
import { AdminRwSertifikasiPendingComponent } from './admin-rw-sertifikasi-pending/admin-rw-sertifikasi-pending.component'

@Component({
    selector: 'app-admin-rw-sertifikasi',
    standalone: true,
    imports: [
        CommonModule,
        AdminRwSertifikasiListComponent,
        AdminRwSertifikasiPendingComponent,
    ],
    templateUrl: './admin-rw-sertifikasi.component.html',
    styleUrl: './admin-rw-sertifikasi.component.scss',
})
export class AdminRwSertifikasiComponent {
    @Input() nip?: string = ''
    activeSubTab: 'sekarang' | 'pending' = 'sekarang'

    changeSubTab(tab: 'sekarang' | 'pending') {
        this.activeSubTab = tab
    }
}
