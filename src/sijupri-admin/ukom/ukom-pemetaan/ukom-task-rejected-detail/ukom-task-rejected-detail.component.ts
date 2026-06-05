import { Component, inject } from '@angular/core'
import { UkomTaskDetailComponent } from '@/sijupri-admin/ukom/ukom-pengajuan/ukom-task-detail/ukom-task-detail.component'
import { CommonModule, Location } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { ParticipantObject } from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'

@Component({
    selector: 'app-ukom-task-rejected-detail',
    standalone: true,
    imports: [UkomTaskDetailComponent, CommonModule, RouterModule],
    templateUrl: './ukom-task-rejected-detail.component.html',
    styleUrl: './ukom-task-rejected-detail.component.scss',
})
export class UkomTaskRejectedDetailComponent {
    pesertaUkom: ParticipantObject
    router = inject(Router)
    location = inject(Location)
    activatedRoute = inject(ActivatedRoute)
    constructor() {}

    onPesertaUkomReceived(event: ParticipantObject) {
        this.pesertaUkom = event
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
    }
}
