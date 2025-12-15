import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    PagableBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { TabService } from '../../../../modules/base/services/tab.service'
import { Router } from '@angular/router'
import { UkomExamScheduleAddComponent } from '../ukom-exam-schedule-add/ukom-exam-schedule-add.component'

@Component({
    selector: 'app-ukom-exam-schedule-list',
    standalone: true,
    imports: [CommonModule, UkomExamScheduleAddComponent],
    templateUrl: './ukom-exam-schedule-list.component.html',
    styleUrl: './ukom-exam-schedule-list.component.scss',
})
export class UkomExamScheduleListComponent {
    tab$ = new BehaviorSubject<number | null>(0)
    pagable: Pagable

    constructor(
        private tabService: TabService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.handlePagable()
        this.handleTabService()
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/examiner_ukom/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'name', ['user']).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Email', 'email', ['user']).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status', ['user']).build(),
            )
            .build()
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Daftar Jadwal Exam Ukom',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.handleTabChange(0),
            })
            .addTab({
                label: 'Tambah Jadwal Exam Ukom',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1),
            })
    }

    handleTabChange(tab?: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }
}
