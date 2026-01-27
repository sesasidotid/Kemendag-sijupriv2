import { Injectable, isDevMode } from '@angular/core'
import {
    OBJECT_STORES,
    TTL_3_DAYS_MS,
    createTransaction,
} from '@/shared/indexeddb'

/**
 * Interface for flagged questions record
 */
export interface FlaggedQuestionsRecord {
    /** Composite key: examScheduleId */
    key: string
    examScheduleId: string
    questionIds: string[]
    expiresAt: number
    updatedAt: number
}

/**
 * Service for managing flagged (uncertain) questions using IndexedDB
 *
 * Features:
 * - Exam-specific storage using examScheduleId as unique key
 * - 3-day TTL expiration
 * - Automatic cleanup on exam finish
 * - Automatic cleanup of expired records
 */
@Injectable({
    providedIn: 'root',
})
export class CatFlaggedQuestionsService {
    private readonly storeName = OBJECT_STORES.CAT_FLAGGED_QUESTIONS

    constructor() {
        // Cleanup expired records on service initialization
        this.cleanupExpired()
    }

    /**
     * Save flagged questions for a specific exam
     */
    async save(
        examScheduleId: string,
        questionIds: Set<string>,
    ): Promise<void> {
        try {
            const { transaction, store } = await createTransaction(
                this.storeName,
                'readwrite',
            )

            const now = Date.now()
            const record: FlaggedQuestionsRecord = {
                key: examScheduleId,
                examScheduleId,
                questionIds: Array.from(questionIds),
                updatedAt: now,
                expiresAt: now + TTL_3_DAYS_MS,
            }

            store.put(record)

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => {
                    if (isDevMode()) {
                        console.log(
                            `[CatFlaggedQuestions] Saved ${questionIds.size} flagged questions for exam: ${examScheduleId}`,
                        )
                    }
                    resolve()
                }
                transaction.onerror = () => reject(transaction.error)
                transaction.onabort = () => reject(transaction.error)
            })
        } catch (error) {
            console.error('[CatFlaggedQuestions] Failed to save:', error)
            throw error
        }
    }

    /**
     * Load flagged questions for a specific exam
     * Returns empty Set if not found or expired
     */
    async load(examScheduleId: string): Promise<Set<string>> {
        try {
            const { transaction, store } = await createTransaction(
                this.storeName,
                'readonly',
            )

            return new Promise((resolve) => {
                const req = store.get(examScheduleId)

                req.onsuccess = () => {
                    const result = req.result as
                        | FlaggedQuestionsRecord
                        | undefined

                    if (!result) {
                        if (isDevMode()) {
                            console.log(
                                `[CatFlaggedQuestions] No record found for exam: ${examScheduleId}`,
                            )
                        }
                        return resolve(new Set())
                    }

                    // Check expiration
                    if (result.expiresAt < Date.now()) {
                        if (isDevMode()) {
                            console.log(
                                `[CatFlaggedQuestions] Record expired for exam: ${examScheduleId}`,
                            )
                        }
                        // Auto-delete expired record (fire-and-forget)
                        this.remove(examScheduleId).catch((err) =>
                            console.warn(
                                '[CatFlaggedQuestions] Failed to delete expired record:',
                                err,
                            ),
                        )
                        return resolve(new Set())
                    }

                    if (isDevMode()) {
                        console.log(
                            `[CatFlaggedQuestions] Loaded ${result.questionIds.length} flagged questions for exam: ${examScheduleId}`,
                        )
                    }
                    resolve(new Set(result.questionIds))
                }

                req.onerror = () => {
                    console.error(
                        '[CatFlaggedQuestions] Failed to load:',
                        req.error,
                    )
                    resolve(new Set()) // Graceful degradation
                }

                transaction.onerror = () => {
                    console.error(
                        '[CatFlaggedQuestions] Transaction error:',
                        transaction.error,
                    )
                    resolve(new Set())
                }
            })
        } catch (error) {
            console.error('[CatFlaggedQuestions] Failed to load:', error)
            return new Set()
        }
    }

    /**
     * Remove flagged questions for a specific exam
     * Call this when user finishes the exam
     */
    async remove(examScheduleId: string): Promise<void> {
        try {
            const { transaction, store } = await createTransaction(
                this.storeName,
                'readwrite',
            )

            store.delete(examScheduleId)

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => {
                    if (isDevMode()) {
                        console.log(
                            `[CatFlaggedQuestions] Removed flagged questions for exam: ${examScheduleId}`,
                        )
                    }
                    resolve()
                }
                transaction.onerror = () => reject(transaction.error)
                transaction.onabort = () => reject(transaction.error)
            })
        } catch (error) {
            console.error('[CatFlaggedQuestions] Failed to remove:', error)
            throw error
        }
    }

    /**
     * Cleanup all expired records
     * Called automatically on service initialization
     */
    async cleanupExpired(): Promise<void> {
        try {
            const { transaction, store } = await createTransaction(
                this.storeName,
                'readwrite',
            )

            const now = Date.now()
            const cursorReq = store.openCursor()
            let deletedCount = 0

            return new Promise((resolve) => {
                cursorReq.onsuccess = (event) => {
                    const cursor = (
                        event.target as IDBRequest<IDBCursorWithValue>
                    ).result
                    if (cursor) {
                        const record = cursor.value as FlaggedQuestionsRecord
                        if (record.expiresAt < now) {
                            cursor.delete()
                            deletedCount++
                        }
                        cursor.continue()
                    } else {
                        if (isDevMode() && deletedCount > 0) {
                            console.log(
                                `[CatFlaggedQuestions] Cleaned up ${deletedCount} expired records`,
                            )
                        }
                        resolve()
                    }
                }

                cursorReq.onerror = () => {
                    console.error(
                        '[CatFlaggedQuestions] Failed to cleanup:',
                        cursorReq.error,
                    )
                    resolve() // Continue even if cleanup fails
                }

                transaction.onerror = () => {
                    console.error(
                        '[CatFlaggedQuestions] Cleanup transaction error:',
                        transaction.error,
                    )
                    resolve()
                }
            })
        } catch (error) {
            console.error('[CatFlaggedQuestions] Failed to cleanup:', error)
        }
    }

    /**
     * Clear all flagged questions (for testing/maintenance)
     */
    async clearAll(): Promise<void> {
        try {
            const { transaction, store } = await createTransaction(
                this.storeName,
                'readwrite',
            )

            store.clear()

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => {
                    if (isDevMode()) {
                        console.log(
                            '[CatFlaggedQuestions] Cleared all flagged questions',
                        )
                    }
                    resolve()
                }
                transaction.onerror = () => reject(transaction.error)
                transaction.onabort = () => reject(transaction.error)
            })
        } catch (error) {
            console.error('[CatFlaggedQuestions] Failed to clear all:', error)
            throw error
        }
    }
}
