import { Injectable } from '@angular/core'
import { MakalahExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'
import {
    DraftRecord,
    GenericDraftService,
} from '@/shared/indexeddb/generic-draft.service'
import { OBJECT_STORES } from '@/shared/indexeddb/db.constants'

/**
 * @deprecated Use DraftRecord<MakalahExamAnswer> instead
 */
export type SeminarMakalahDraft = DraftRecord<MakalahExamAnswer>

/**
 * Seminar Makalah Draft Service
 *
 * Manages draft persistence for Seminar Makalah exam answers using centralized IndexedDB
 *
 * Features:
 * - Automatic 24-hour TTL
 * - Safe concurrent access
 * - Survives page refreshes
 */
@Injectable({
    providedIn: 'root',
})
export class SeminarMakalahDraftService extends GenericDraftService<MakalahExamAnswer> {
    constructor() {
        super(OBJECT_STORES.SEMINAR_MAKALAH_ANSWERS)
    }
}
