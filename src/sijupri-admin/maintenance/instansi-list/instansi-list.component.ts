import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { TabService } from '../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { InstasiAddComponent } from '../instasi-add/instasi-add.component'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-instansi-list',
    standalone: true,
    imports: [PagableComponent, InstasiAddComponent, CommonModule],
    templateUrl: './instansi-list.component.html',
    styleUrl: './instansi-list.component.scss'
})
export class InstansiListComponent {
    pagable: Pagable
    tab$ = new BehaviorSubject<number | null>(0)
    refreshToggle: boolean = false

    constructor(private router: Router, private tabService: TabService) {
    }

    ngOnInit(): void {
        this.handlePagable()
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/instansi/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: any) => { }, 'danger')
                    .withIcon('danger')
                    .addInactiveCondition((item: any) => true)
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name')
                    .withField('Nama', 'text')
                    .build()
            )
            .build()
    }
}
