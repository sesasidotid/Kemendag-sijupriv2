import { ModalComponent } from './../../../modules/base/components/modal/modal.component'
import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { CommonModule } from '@angular/common'
import { BehaviorSubject, finalize, Observable } from 'rxjs'
import { ForcePasswordFormComponent } from '../../../modules/base/components/force-password-form/force-password-form.component'
import { JfService } from '@/modules/siap/services/jf.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { JF } from "@/modules/siap/models/jf.model"
@Component({
    selector: 'app-jf-list',
    standalone: true,
    imports: [
        PagableComponent,
        ModalComponent,
        ForcePasswordFormComponent,
        CommonModule,
    ],
    templateUrl: './jf-list.component.html',
    styleUrl: './jf-list.component.scss',
})
export class JfListComponent {
    pagable!: Pagable
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    userId: string

    deleteLoadingSubject = new BehaviorSubject<boolean>(false)
    deleteLoading$ = this.deleteLoadingSubject.asObservable()

    refresh: boolean
    constructor(
        private router: Router,
        private jfService: JfService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
    ) { }

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/jf/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'name', ['user']).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Email', 'email', ['user']).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status', ['user']).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((jf: JF) => {
                        this.router.navigate([`/siap/user-jf/${jf.nip}`])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((user: JF) => {
                        this.userId = user.nip
                        this.toggleModal()
                    }, 'warning')
                    .withIcon('password')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((user: JF) => {
                        this.deleteJFByNip(user.nip)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('nip')
                    .withField('NIP', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('user|name')
                    .withField('Nama', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('user|email')
                    .withField('Email', 'text')
                    .build(),
            )
            .build()
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    deleteJFByNip(nip: string) {
        this.confirmationService.open(false).subscribe((res) => {
            if (!res.confirmed) return

            this.deleteLoadingSubject.next(true)
            this.jfService
                .delete(nip)
                .pipe(
                    finalize(() => {
                        this.deleteLoadingSubject.next(false)
                    }),
                )
                .subscribe({
                    next: () => {
                        this.handlerService.handleAlert("Success", "Berhasil menghapus Akun JF")
                        this.refresh = !this.refresh
                    },
                })
        })
    }
}
