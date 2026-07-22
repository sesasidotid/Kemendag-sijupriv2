import { Component } from '@angular/core'
import { ApiService } from '../../../modules/base/services/api.service'
import { ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { User } from '../../../modules/security/models/user.model'
import { AlertService } from '../../../modules/base/services/alert.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { LoadingButtonComponent } from '../../../modules/base/components/loading-button/loading-button.component'
import { BehaviorSubject } from 'rxjs'
import { Role } from '@/modules/security/models/role.model'
@Component({
    selector: 'app-user-detail',
    standalone: true,
    imports: [CommonModule, LoadingButtonComponent],
    templateUrl: './user-detail.component.html',
    styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
    id: string
    userData: User = new User()
    isLoading$ = new BehaviorSubject<boolean>(false)
    roles: Role[] = []

    constructor(
        private router: Router,
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe((params) => {
            this.id = params.get('id')
        })
        this.getAllRoles()
        this.getUserDetailData()
    }

    backToList() {
        this.router.navigate(['/security/user'])
    }

    delete() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                this.isLoading$.next(true)

                this.apiService
                    .deleteData(`/api/v1/user/${this.id}`)
                    .subscribe({
                        next: () => {
                            this.isLoading$.next(false)
                            this.router.navigate(['/security/user'])
                            this.alertService.showToast(
                                'Success',
                                'Berhasil Menghapus user',
                            )
                        },
                        error: (error) => {
                            this.isLoading$.next(false)
                            console.error('Error fetching data', error)
                            this.alertService.showToast(
                                'Error',
                                'Terjadi Masalah',
                            )
                        },
                    })
            },
        })
    }

    getUserDetailData() {
        this.apiService.getData(`/api/v1/user/${this.id}`).subscribe({
            next: (response) => {
                this.userData = new User(response)
                console.log('adara : ', this.userData)
            },
            error: (error) => {
                this.alertService.showToast('Error', 'Terjadi Masalah')
            },
        })
    }

    getAllRoles(): void {
        console.log('getAllRoles')

        this.apiService.getData('/api/v1/role').subscribe({
            next: (roles: Role[]) => {
                this.roles = roles
            },
            error: (err) => {
                console.error(err)
            },
        })
    }

    getRoles(): string {
        if (!this.userData?.userRoleList?.length) {
            return '-'
        }

        return this.userData.userRoleList
            .map((userRole: any) => {
                const role = this.roles.find(
                    (r) => r.code === userRole.roleCode,
                )

                return role?.name ?? userRole.roleCode
            })
            .join(', ')
    }
}
