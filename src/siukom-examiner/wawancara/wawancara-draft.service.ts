import { Injectable } from '@angular/core'
import { WawancaraExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'
import { GenericDraftService, DraftRecord } from '@/shared/indexeddb/generic-draft.service'
import { OBJECT_STORES } from '@/shared/indexeddb/db.constants'

/**
 * @deprecated Use DraftRecord<WawancaraExamAnswer> instead
 */
export type WawancaraDraft = DraftRecord<WawancaraExamAnswer>

/**
 * Wawancara Draft Service
 *
 * Manages draft persistence for Wawancara exam answers using centralized IndexedDB
 *
 * Features:
 * - Automatic 24-hour TTL
 * - Safe concurrent access
 * - Survives page refreshes
 */
@Injectable({
    providedIn: 'root',
})
export class WawancaraDraftService extends GenericDraftService<WawancaraExamAnswer> {
    constructor() {
        super(OBJECT_STORES.WAWANCARA_ANSWERS)
    }
}
