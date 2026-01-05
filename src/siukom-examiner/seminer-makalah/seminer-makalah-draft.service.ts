import { Injectable } from '@angular/core'
import { MakalahExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'

const DB_NAME = 'ukom_exam_db'
const DB_VERSION = 1
const STORE_NAME = 'seminar_makalah_answers'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export interface SeminarMakalahDraft {
    key: string
    examId: string
    participantId: string
    answers: Record<string, MakalahExamAnswer>
    expiresAt: number
    updatedAt: number
}

@Injectable({
    providedIn: 'root',
})
export class SeminarMakalahDraftService {
    private readonly dbPromise: Promise<IDBDatabase>
    constructor() {
        this.dbPromise = this.openDB()
    }

    async save(
        examId: string,
        participantId: string,
        answers: Record<string, MakalahExamAnswer>,
    ): Promise<void> {
        const db = await this.dbPromise
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        const now = Date.now()

        store.put({
            key: this.makeKey(examId, participantId),
            examId,
            participantId,
            answers,
            updatedAt: now,
            expiresAt: now + TTL_MS,
        })

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
            tx.onabort = () => reject(tx.error)
        })
    }

    async load(
        examId: string,
        participantId: string,
    ): Promise<SeminarMakalahDraft | null> {
        const db = await this.dbPromise
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)

        const key = this.makeKey(examId, participantId)

        return new Promise((resolve) => {
            const req = store.get(key)

            req.onsuccess = () => {
                const result = req.result as SeminarMakalahDraft | undefined
                if (!result) return resolve(null)

                // Expired → auto delete
                if (result.expiresAt < Date.now()) {
                    this.remove(examId, participantId)
                    return resolve(null)
                }

                resolve(result)
            }

            req.onerror = () => resolve(null)
        })
    }

    async remove(examId: string, participantId: string): Promise<void> {
        const db = await this.dbPromise
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        store.delete(this.makeKey(examId, participantId))

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
            tx.onabort = () => reject(tx.error)
        })
    }

    private openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'key' })
                }
            }

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    private makeKey(examId: string, participantId: string) {
        return `${examId}_${participantId}`
    }
}
