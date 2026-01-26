import { Injectable } from '@angular/core'
import { GenericDraftService, OBJECT_STORES } from '@/shared/indexeddb'
import { ExamAnswerDto } from '@/modules/ukom/models/exam/exam-answer.model'

@Injectable({
    providedIn: 'root',
})
export class PracticalWorkDraftService extends GenericDraftService<ExamAnswerDto> {
    constructor() {
        super(OBJECT_STORES.PRAKTIK)
    }
}
