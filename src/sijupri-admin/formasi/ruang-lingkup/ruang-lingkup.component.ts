import { Component, inject, OnInit } from '@angular/core'
import { TabService } from '@/modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { AddRuangLingkupComponent } from '@/sijupri-admin/formasi/ruang-lingkup/add-ruang-lingkup/add-ruang-lingkup.component'
import { toSignal } from '@angular/core/rxjs-interop'

@Component({
    selector: 'app-ruang-lingkup',
    standalone: true,
    imports: [CommonModule, AddRuangLingkupComponent],
    templateUrl: './ruang-lingkup.component.html',
    styleUrl: './ruang-lingkup.component.scss',
})
export class RuangLingkupComponent implements OnInit {
    tabService = inject(TabService)
    activeTab = toSignal(this.tabService.activeTab$, { initialValue: 0 })

    ngOnInit() {
        this.initTabs()
        this.initPagable()
    }

    initTabs() {
        this.tabService.clearTabs()

        this.tabService
            .addTab({
                isActive: true,
                label: 'Daftar Ruang Lingkup',
                onClick: () => {
                    this.tabService.changeTabActive(0)
                },
                icon: 'mdi-list-box',
            })
            .addTab({
                label: 'Tambah Ruang Linkup',
                onClick: () => {
                    this.tabService.changeTabActive(1)
                },
                icon: 'mdi-plus-circle',
            })
    }

    initPagable() {
        // TODO: implement pagable initialization
    }

    handleDeleteRuangLingkup() {}

    handleUpdateRuangLingkup() {}
}
