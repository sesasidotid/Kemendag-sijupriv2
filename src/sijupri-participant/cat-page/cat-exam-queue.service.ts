import { Injectable } from '@angular/core'

interface PendingViolation {
    reason: string
    timestamp: number
}

interface PendingMouseAway {
    numOfSeconds: number
    timestamp: number
}

interface ExamQueue {
    examScheduleId: string
    violations: PendingViolation[]
    mouseAwayDurations: PendingMouseAway[]
    lastUpdated: number
}

/**
 * Service to manage exam security queues using IndexedDB for persistence
 * Survives page refreshes and browser restarts
 */
@Injectable({
    providedIn: 'root',
})
export class CatExamQueueService {
    private readonly DB_NAME = 'CatExamQueueDB'
    private readonly DB_VERSION = 1
    private readonly STORE_NAME = 'examQueues'
    private db: IDBDatabase | null = null

    constructor() {
        this.initDB()
    }

    /**
     * Initialize IndexedDB
     */
    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error)
                reject(request.error)
            }

            request.onsuccess = () => {
                this.db = request.result
                resolve()
            }

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const objectStore = db.createObjectStore(this.STORE_NAME, {
                        keyPath: 'examScheduleId',
                    })
                    objectStore.createIndex('lastUpdated', 'lastUpdated', {
                        unique: false,
                    })
                }
            }
        })
    }

    /**
     * Ensure DB is ready before operations
     */
    private async ensureDB(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.initDB()
        }
        if (!this.db) {
            throw new Error('IndexedDB is not available')
        }
        return this.db
    }

    /**
     * Get queue for a specific exam schedule
     */
    async getQueue(examScheduleId: string): Promise<ExamQueue | null> {
        try {
            const db = await this.ensureDB()
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(
                    [this.STORE_NAME],
                    'readonly',
                )
                const store = transaction.objectStore(this.STORE_NAME)
                const request = store.get(examScheduleId)

                request.onsuccess = () => {
                    resolve(request.result || null)
                }

                request.onerror = () => {
                    console.error('Failed to get queue:', request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error getting queue:', error)
            return null
        }
    }

    /**
     * Add a violation to the queue
     */
    async addViolation(
        examScheduleId: string,
        violation: PendingViolation,
    ): Promise<void> {
        try {
            const db = await this.ensureDB()
            const queue = (await this.getQueue(examScheduleId)) || {
                examScheduleId,
                violations: [],
                mouseAwayDurations: [],
                lastUpdated: Date.now(),
            }

            queue.violations.push(violation)
            queue.lastUpdated = Date.now()

            await this.saveQueue(queue)
        } catch (error) {
            console.error('Error adding violation to queue:', error)
        }
    }

    /**
     * Add a mouse away duration to the queue
     */
    async addMouseAway(
        examScheduleId: string,
        mouseAway: PendingMouseAway,
    ): Promise<void> {
        try {
            const db = await this.ensureDB()
            const queue = (await this.getQueue(examScheduleId)) || {
                examScheduleId,
                violations: [],
                mouseAwayDurations: [],
                lastUpdated: Date.now(),
            }

            queue.mouseAwayDurations.push(mouseAway)
            queue.lastUpdated = Date.now()

            await this.saveQueue(queue)
        } catch (error) {
            console.error('Error adding mouse away to queue:', error)
        }
    }

    /**
     * Save queue to IndexedDB
     */
    private async saveQueue(queue: ExamQueue): Promise<void> {
        const db = await this.ensureDB()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite')
            const store = transaction.objectStore(this.STORE_NAME)
            const request = store.put(queue)

            request.onsuccess = () => {
                resolve()
            }

            request.onerror = () => {
                console.error('Failed to save queue:', request.error)
                reject(request.error)
            }
        })
    }

    /**
     * Remove violations from queue (after successful send)
     */
    async removeViolations(
        examScheduleId: string,
        count: number,
    ): Promise<void> {
        try {
            const queue = await this.getQueue(examScheduleId)
            if (!queue) return

            queue.violations.splice(0, count)
            queue.lastUpdated = Date.now()

            if (
                queue.violations.length === 0 &&
                queue.mouseAwayDurations.length === 0
            ) {
                await this.clearQueue(examScheduleId)
            } else {
                await this.saveQueue(queue)
            }
        } catch (error) {
            console.error('Error removing violations from queue:', error)
        }
    }

    /**
     * Remove mouse away durations from queue (after successful send)
     */
    async removeMouseAwayDurations(
        examScheduleId: string,
        count: number,
    ): Promise<void> {
        try {
            const queue = await this.getQueue(examScheduleId)
            if (!queue) return

            queue.mouseAwayDurations.splice(0, count)
            queue.lastUpdated = Date.now()

            if (
                queue.violations.length === 0 &&
                queue.mouseAwayDurations.length === 0
            ) {
                await this.clearQueue(examScheduleId)
            } else {
                await this.saveQueue(queue)
            }
        } catch (error) {
            console.error(
                'Error removing mouse away durations from queue:',
                error,
            )
        }
    }

    /**
     * Clear entire queue for an exam (after exam finish or successful submission)
     */
    async clearQueue(examScheduleId: string): Promise<void> {
        try {
            const db = await this.ensureDB()
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(
                    [this.STORE_NAME],
                    'readwrite',
                )
                const store = transaction.objectStore(this.STORE_NAME)
                const request = store.delete(examScheduleId)

                request.onsuccess = () => {
                    resolve()
                }

                request.onerror = () => {
                    console.error('Failed to clear queue:', request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error clearing queue:', error)
        }
    }

    /**
     * Clear all queues (for maintenance or testing)
     */
    async clearAllQueues(): Promise<void> {
        try {
            const db = await this.ensureDB()
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(
                    [this.STORE_NAME],
                    'readwrite',
                )
                const store = transaction.objectStore(this.STORE_NAME)
                const request = store.clear()

                request.onsuccess = () => {
                    resolve()
                }

                request.onerror = () => {
                    console.error('Failed to clear all queues:', request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error clearing all queues:', error)
        }
    }

    /**
     * Clean up old queues (older than 7 days)
     */
    async cleanupOldQueues(): Promise<void> {
        try {
            const db = await this.ensureDB()
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(
                    [this.STORE_NAME],
                    'readwrite',
                )
                const store = transaction.objectStore(this.STORE_NAME)
                const index = store.index('lastUpdated')
                const request = index.openCursor(
                    IDBKeyRange.upperBound(sevenDaysAgo),
                )

                request.onsuccess = (event) => {
                    const cursor = (
                        event.target as IDBRequest<IDBCursorWithValue>
                    ).result
                    if (cursor) {
                        cursor.delete()
                        cursor.continue()
                    } else {
                        resolve()
                    }
                }

                request.onerror = () => {
                    console.error(
                        'Failed to cleanup old queues:',
                        request.error,
                    )
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error cleaning up old queues:', error)
        }
    }
}
