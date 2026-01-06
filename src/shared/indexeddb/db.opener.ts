import {
    DB_NAME,
    DB_VERSION,
    OBJECT_STORES,
    ObjectStoreName,
    STORE_CONFIGS,
} from './db.constants'
import { isDevMode } from '@angular/core'

/**
 * Centralized IndexedDB opener
 *
 * SINGLE SOURCE OF TRUTH for database schema
 * All services MUST use this instead of opening DB directly
 *
 * Features:
 * - Idempotent store creation
 * - Safe upgrade handling
 * - Runtime store validation
 * - Development mode diagnostics
 */

let dbPromise: Promise<IDBDatabase> | null = null
let dbInstance: IDBDatabase | null = null

/**
 * Opens the shared IndexedDB database
 * Returns a singleton promise to prevent multiple concurrent opens
 */
export function openUkomDB(): Promise<IDBDatabase> {
    // Return existing promise if DB is already opening/opened
    if (dbPromise) {
        return dbPromise
    }

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        if (isDevMode()) {
            console.log(`[IndexedDB] Opening ${DB_NAME} v${DB_VERSION}`)
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
            const error = request.error || new Error('Unknown IndexedDB error')
            console.error('[IndexedDB] Failed to open database:', error)
            dbPromise = null // Reset so retry is possible
            reject(error)
        }

        request.onsuccess = () => {
            const db = request.result

            if (isDevMode()) {
                console.log('[IndexedDB] Database opened successfully')
                console.log(
                    '[IndexedDB] Available stores:',
                    Array.from(db.objectStoreNames),
                )
            }

            // Store instance for validation
            dbInstance = db

            // Handle unexpected close (dev mode HMR, etc)
            db.onversionchange = () => {
                if (isDevMode()) {
                    console.warn(
                        '[IndexedDB] Version change detected, closing connection',
                    )
                }
                db.close()
                dbPromise = null
                dbInstance = null
            }

            // Handle connection errors
            db.onerror = (event) => {
                console.error('[IndexedDB] Database error:', event)
            }

            resolve(db)
        }

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = request.result
            const oldVersion = event.oldVersion
            const newVersion = event.newVersion || DB_VERSION

            if (isDevMode()) {
                console.log(
                    `[IndexedDB] Upgrading from v${oldVersion} to v${newVersion}`,
                )
            }

            // Create ALL object stores defined in constants
            Object.entries(OBJECT_STORES).forEach(([key, storeName]) => {
                if (!db.objectStoreNames.contains(storeName)) {
                    const config = STORE_CONFIGS[storeName]

                    if (isDevMode()) {
                        console.log(`[IndexedDB] Creating store: ${storeName}`)
                    }

                    const objectStore = db.createObjectStore(storeName, {
                        keyPath: config.keyPath,
                    })

                    // Create indexes if defined
                    if (config.indexes) {
                        config.indexes.forEach((index) => {
                            objectStore.createIndex(
                                index.name,
                                index.keyPath,
                                index.options,
                            )
                        })
                    }
                } else if (isDevMode()) {
                    console.log(
                        `[IndexedDB] Store already exists: ${storeName}`,
                    )
                }
            })

            if (isDevMode()) {
                console.log('[IndexedDB] Upgrade complete')
            }
        }

        request.onblocked = () => {
            console.warn(
                '[IndexedDB] Database upgrade blocked. Close all other tabs using this app.',
            )
        }
    })

    return dbPromise
}

/**
 * Validates that a store exists in the database
 * Attempts to reopen DB if store is missing (handles HMR edge cases)
 */
export async function ensureStoreExists(
    storeName: ObjectStoreName,
): Promise<IDBDatabase> {
    let db = await openUkomDB()

    // Check if store exists
    if (!db.objectStoreNames.contains(storeName)) {
        console.warn(
            `[IndexedDB] Store "${storeName}" not found. Attempting to recover...`,
        )

        // Close current connection
        db.close()
        dbPromise = null
        dbInstance = null

        // Force re-open (in dev mode, may trigger upgrade)
        if (isDevMode()) {
            // In dev, delete and recreate to fix schema corruption
            await deleteDatabase()
        }

        db = await openUkomDB()

        // Verify store exists now
        if (!db.objectStoreNames.contains(storeName)) {
            throw new Error(
                `[IndexedDB] Store "${storeName}" still missing after recovery. ` +
                    `DB version may need increment. Current stores: ${Array.from(db.objectStoreNames)}`,
            )
        }

        console.log(`[IndexedDB] Store "${storeName}" recovered successfully`)
    }

    return db
}

/**
 * Safely creates a transaction with store validation
 * Use this instead of db.transaction() directly
 */
export async function createTransaction(
    storeName: ObjectStoreName,
    mode: IDBTransactionMode = 'readonly',
): Promise<{ transaction: IDBTransaction; store: IDBObjectStore }> {
    const db = await ensureStoreExists(storeName)

    try {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        return { transaction, store }
    } catch (error) {
        console.error(
            `[IndexedDB] Failed to create transaction for "${storeName}":`,
            error,
        )
        throw error
    }
}

/**
 * Deletes the entire database (dev mode recovery)
 */
export async function deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.warn(`[IndexedDB] Deleting database: ${DB_NAME}`)

        if (dbInstance) {
            dbInstance.close()
            dbInstance = null
        }

        dbPromise = null

        const request = indexedDB.deleteDatabase(DB_NAME)

        request.onsuccess = () => {
            console.log('[IndexedDB] Database deleted successfully')
            resolve()
        }

        request.onerror = () => {
            console.error(
                '[IndexedDB] Failed to delete database:',
                request.error,
            )
            reject(request.error)
        }

        request.onblocked = () => {
            console.warn(
                '[IndexedDB] Database deletion blocked. Close other tabs.',
            )
        }
    })
}

/**
 * Gets the current database instance (if opened)
 * Useful for debugging
 */
export function getDBInstance(): IDBDatabase | null {
    return dbInstance
}

/**
 * Resets the database connection
 * Useful for testing or forcing a fresh connection
 */
export function resetConnection(): void {
    if (dbInstance) {
        dbInstance.close()
        dbInstance = null
    }
    dbPromise = null
}
