import { Injectable } from '@angular/core'
import { GenericDraftService } from '@/shared/indexeddb/generic-draft.service'
import { OBJECT_STORES } from '@/shared/indexeddb/db.constants'
import { ExamAnswerDto } from '@/modules/ukom/models/exam/exam-answer.model'

/**
 * Draft service for Studi Kasus answers
 * Extends GenericDraftService with ExamAnswerDto type
 */
@Injectable({
    providedIn: 'root',
})
export class StudiKasusDraftService extends GenericDraftService<ExamAnswerDto> {
    constructor() {
        super(OBJECT_STORES.STUDI_KASUS_ANSWERS)
    }
}
