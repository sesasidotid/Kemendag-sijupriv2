import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TabService } from '@/modules/base/services/tab.service'
import { toSignal } from '@angular/core/rxjs-interop'
import {
    AddDefinisiOperasionalComponent
} from '@/sijupri-admin/formasi/ruang-lingkup/detail-ruang-lingkup/add-definisi-operasional/add-definisi-operasional.component'

@Component({
    selector: 'app-detail-ruang-lingkup',
    standalone: true,
    imports: [CommonModule, AddDefinisiOperasionalComponent],
    templateUrl: './detail-ruang-lingkup.component.html',
    styleUrl: './detail-ruang-lingkup.component.scss',
})
export class DetailRuangLingkupComponent implements OnInit {
    tabService = inject(TabService)
    ruangLingkup = signal(DUMMY_RUANG_LINGKUP)

    activeTab = toSignal(this.tabService.activeTab$, { initialValue: 0 })

    pageLoading = signal(false)

    ngOnInit() {
        this.initTabs()
    }

    initTabs() {
        this.tabService.clearTabs()

        this.tabService
            .addTab({
                isActive: true,
                label: 'Ruang Linkup',
                onClick: () => {
                    this.tabService.changeTabActive(0)
                },
                icon: 'mdi-list-box',
            })
            .addTab({
                label: 'Tambah Definisi Operasional',
                onClick: () => {
                    this.tabService.changeTabActive(1)
                },
                icon: 'mdi-plus-circle',
            })
    }
    back() {}
}

interface RuangLingkup {
    id: string
    name: string
    jabatanCode: string
    jabatanName: string
}

const DUMMY_RUANG_LINGKUP: RuangLingkup = {
    id: '1',
    name: 'Ruang Lingkup Contoh',
    jabatanCode: 'JBT001',
    jabatanName: 'Jabatan Contoh',
}
