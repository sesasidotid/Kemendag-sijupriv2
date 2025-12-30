import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ScheduleSlot, ParticipantSchedule } from '@/modules/ukom/models/schedule-slot.model'
import { ScheduleSlotService } from '@/modules/ukom/services/schedule-slot.service'

@Component({
    selector: 'app-reschedule-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent],
    templateUrl: './reschedule-modal.component.html',
    styleUrls: ['./reschedule-modal.component.scss'],
})
export class RescheduleModalComponent implements OnInit {
    @Input() participant!: ParticipantSchedule
    @Input() availableSlots: ScheduleSlot[] = []
    @Input() currentSlot: ScheduleSlot | null = null
    
    @Output() close = new EventEmitter<void>()
    @Output() confirm = new EventEmitter<{ participant: ParticipantSchedule; newSlot: ScheduleSlot }>()

    selectedSlot: ScheduleSlot | null = null

    constructor(public slotService: ScheduleSlotService) {}

    ngOnInit(): void {
        // Pre-select current slot if exists
        if (this.currentSlot) {
            this.selectedSlot = this.currentSlot
        }
    }

    onSlotSelect(slot: ScheduleSlot): void {
        this.selectedSlot = slot
    }

    onConfirm(): void {
        if (this.selectedSlot) {
            this.confirm.emit({
                participant: this.participant,
                newSlot: this.selectedSlot,
            })
        }
    }

    onClose(): void {
        this.close.emit()
    }

    isSlotSelected(slot: ScheduleSlot): boolean {
        return this.selectedSlot?.slotIndex === slot.slotIndex
    }
}
