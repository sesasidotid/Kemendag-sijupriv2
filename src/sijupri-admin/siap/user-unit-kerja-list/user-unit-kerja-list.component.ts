import { ConfirmationService } from '@/modules/base/services/confirmation.service';
import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { CommonModule } from '@angular/common'
import { ForcePasswordFormComponent } from '../../../modules/base/components/force-password-form/force-password-form.component'
import { BehaviorSubject } from 'rxjs'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { HandlerService } from '@/modules/base/services/handler.service';
import { UserUnitKerjaService } from '@/modules/siap/services/user-unit-kerja.service';
import { UserUnitKerja } from '@/modules/siap/models/user-unit-kerja.model';
@Component({
    selector: 'app-user-unit-kerja-list',
    standalone: true,
    imports: [
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

    refresh: boolean


    constructor(private router: Router, private confirmationService: ConfirmationService, private handlerService: HandlerService, private userUnitKerja: UserUnitKerjaService) { }

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
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
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((unitKerja: UserUnitKerja) => {
                        this.deleteUserUnitKerjaByNip(unitKerja.nip)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
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

    togglePasswordModal() {
        this.isModalPasswordOpen$.next(!this.isModalPasswordOpen$.value)
    }
    deleteUserUnitKerjaByNip(nip: string) {
        this.confirmationService.open(false).subscribe((res) => {
            if (!res.confirmed) return

            this.userUnitKerja
                .delete(nip)
                .subscribe({
                    next: () => {
                        this.handlerService.handleAlert("Success", "Berhasil menghapus User Unit Kerja")
                        this.refresh = !this.refresh
                    },
                })
        })
    }
}
