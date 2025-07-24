import { Component } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import { ForcePasswordFormComponent } from '../../../modules/base/components/force-password-form/force-password-form.component'
import { BehaviorSubject } from 'rxjs'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'

@Component({
    selector: 'app-user-unit-kerja-list',
    standalone: true,
    imports: [
        RouterLink,
        PagableComponent,
        ForcePasswordFormComponent,
        CommonModule,
        ModalComponent
    ],
    templateUrl: './user-unit-kerja-list.component.html',
    styleUrl: './user-unit-kerja-list.component.scss'
})
export class UserUnitKerjaListComponent {
    pagable!: Pagable
    isModalPasswordOpen$ = new BehaviorSubject<boolean>(false)
    userId: string

    constructor (private router: Router) {}

    ngOnInit () {
        this.handlePagable()
    }

    handlePagable () {
        this.pagable = new PagableBuilder('/api/v1/user_unit_kerja/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'name', ['user']).build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Email', 'email', ['user']).build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Unit Kerja', 'name', [
                    'unitKerja'
                ]).build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Instansi', 'name', [
                    'instansi'
                ]).build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((unitKerja: any) => {
                        this.router.navigate([
                            `/siap/user-unit-kerja/${unitKerja.nip}`
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((user: any) => {
                        this.userId = user.nip
                        this.togglePasswordModal()
                    }, 'warning')
                    .withIcon('password')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('nip')
                    .withField('NIP', 'text')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name', ['user'])
                    .withField('Nama', 'text')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('email', ['user'])
                    .withField('Email', 'text')
                    .build()
            )
            .build()
    }

    togglePasswordModal () {
        this.isModalPasswordOpen$.next(!this.isModalPasswordOpen$.value)
    }
}
