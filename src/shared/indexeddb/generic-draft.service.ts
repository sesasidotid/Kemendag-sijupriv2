import { ObjectStoreName, TTL_MS } from './db.constants'
import { createTransaction } from './db.opener'

/**
 * Base interface for draft records with TTL
 */
export interface DraftRecord<T = any> {
    key: string
    examId: string
    participantId: string
    answers: Record<string, T>
    expiresAt: number
    updatedAt: number
}

/**
 * Generic Draft Service
 *
 * Provides reusable draft persistence logic with:
 * - TTL-based expiration
 * - Safe IndexedDB access
 * - Type-safe operations
 *
 * Usage:
 * ```ts
 * class WawancaraDraftService extends GenericDraftService<WawancaraExamAnswer> {
 *   constructor() {
 *     super(OBJECT_STORES.WAWANCARA_ANSWERS)
 *   }
 * }
 * ```
 */
export abstract class GenericDraftService<TAnswer = any> {
    constructor(private readonly storeName: ObjectStoreName) {}

    /**
     * Save draft answers with automatic TTL
     */
    async save(
        examId: string,
        participantId: string,
        answers: Record<string, TAnswer>,
    ): Promise<void> {
        const { transaction, store } = await createTransaction(
            this.storeName,
            'readwrite',
        )

        const now = Date.now()
        const record: DraftRecord<TAnswer> = {
            key: this.makeKey(examId, participantId),
            examId,
            participantId,
            answers,
            updatedAt: now,
            expiresAt: now + TTL_MS,
        }

        store.put(record)

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve()
            transaction.onerror = () => reject(transaction.error)
            transaction.onabort = () => reject(transaction.error)
        })
    }

    /**
     * Load draft answers
     * Returns null if not found or expired
     */
    async load(
        examId: string,
        participantId: string,
    ): Promise<DraftRecord<TAnswer> | null> {
        const { transaction, store } = await createTransaction(
            this.storeName,
            'readonly',
        )

        const key = this.makeKey(examId, participantId)

        return new Promise((resolve) => {
            const req = store.get(key)

            req.onsuccess = () => {
                const result = req.result as DraftRecord<TAnswer> | undefined

                if (!result) {
                    return resolve(null)
                }

                // Check expiration
                if (result.expiresAt < Date.now()) {
                    // Auto-delete expired record (fire-and-forget)
                    this.remove(examId, participantId).catch((err) =>
                        console.warn('Failed to delete expired draft:', err),
                    )
                    return resolve(null)
                }

                resolve(result)
            }

            req.onerror = () => {
                console.error('Failed to load draft:', req.error)
                resolve(null) // Graceful degradation
            }

            transaction.onerror = () => {
                console.error('Transaction error:', transaction.error)
                resolve(null)
            }
        })
    }

    /**
     * Remove draft record
     */
    async remove(examId: string, participantId: string): Promise<void> {
        const { transaction, store } = await createTransaction(
            this.storeName,
            'readwrite',
        )

        const key = this.makeKey(examId, participantId)
        store.delete(key)

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve()
            transaction.onerror = () => reject(transaction.error)
            transaction.onabort = () => reject(transaction.error)
        })
    }

    /**
     * List all non-expired drafts
     * Useful for debugging or cleanup
     */
    async listAll(): Promise<DraftRecord<TAnswer>[]> {
        const { transaction, store } = await createTransaction(
            this.storeName,
            'readonly',
        )

        return new Promise((resolve, reject) => {
            const req = store.getAll()

            req.onsuccess = () => {
                const results = req.result as DraftRecord<TAnswer>[]
                const now = Date.now()

                // Filter expired
                const valid = results.filter((r) => r.expiresAt >= now)
                resolve(valid)
            }

            req.onerror = () => reject(req.error)
            transaction.onerror = () => reject(transaction.error)
        })
    }

    /**
     * Clear all expired drafts in this store
     */
    async clearExpired(): Promise<number> {
        const { transaction, store } = await createTransaction(
            this.storeName,
            'readwrite',
        )

        return new Promise((resolve, reject) => {
            const req = store.openCursor()
            let deletedCount = 0
            const now = Date.now()

            req.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
                    .result

                if (cursor) {
                    const record = cursor.value as DraftRecord<TAnswer>

                    if (record.expiresAt < now) {
                        cursor.delete()
                        deletedCount++
                    }

                    cursor.continue()
                } else {
                    // Cursor exhausted
                    resolve(deletedCount)
                }
            }

            req.onerror = () => reject(req.error)
            transaction.onerror = () => reject(transaction.error)
        })
    }

    /**
     * Check if a draft exists (without loading)
     */
    async exists(examId: string, participantId: string): Promise<boolean> {
        const { transaction, store } = await createTransaction(
            this.storeName,
            'readonly',
        )

        const key = this.makeKey(examId, participantId)

        return new Promise((resolve) => {
            const req = store.getKey(key)

            req.onsuccess = () => {
                resolve(req.result !== undefined)
            }

            req.onerror = () => resolve(false)
            transaction.onerror = () => resolve(false)
        })
    }

    /**
     * Generate composite key for storage
     */
    protected makeKey(examId: string, participantId: string): string {
        return `${examId}_${participantId}`
    }
}
