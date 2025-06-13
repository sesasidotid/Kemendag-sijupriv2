import { Component } from '@angular/core'
import { RoomUkom } from '../../modules/ukom/models/room-ukom.model'
import { ApiService } from '../../modules/base/services/api.service'
import { Router } from '@angular/router'
import { HandlerService } from '../../modules/base/services/handler.service'
import { ConfirmationService } from '../../modules/base/services/confirmation.service'
import { LoginContext } from '../../modules/base/commons/login-context'
import { tap } from 'rxjs'
import { UkomMakalahComponent } from '../ukom-makalah/ukom-makalah.component'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-makalah-page',
    standalone: true,
    imports: [UkomMakalahComponent, CommonModule],
    templateUrl: './makalah-page.component.html',
    styleUrl: './makalah-page.component.scss'
})
export class MakalahPageComponent {
    participant_id: string = ''
    roomUkom: RoomUkom = new RoomUkom()

    constructor (
        private apiService: ApiService,
        private router: Router,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit () {
        this.getRoomUkom()
    }

    afterSubmit () {
        this.router.navigate(['/'])
    }

    getRoomUkom (): void {
        const userId = LoginContext.getUserId().replace('PU-', '')

        this.apiService
            .getData(`/api/v1/participant_ukom/nip/${userId}`)
            .pipe(
                tap((response: any) => {
                    this.roomUkom = new RoomUkom(response.roomUkomDto)
                    this.participant_id = response.id
                })
            )
            .subscribe({
                next: () => {},
                error: err => {
                    console.error('Error fetching RoomUkom or scores:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data.'
                    )
                }
            })
    }
}
