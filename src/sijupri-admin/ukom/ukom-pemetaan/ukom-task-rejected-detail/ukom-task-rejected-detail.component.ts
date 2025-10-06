import { Component } from '@angular/core'
import { UkomTaskDetailComponent } from '@/sijupri-admin/ukom/ukom-pengajuan/ukom-task-detail/ukom-task-detail.component'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
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

    constructor() {}

    onPesertaUkomReceived(event: ParticipantObject) {
        this.pesertaUkom = event
    }
}
