/**
 * Centralized IndexedDB Configuration
 *
 * ALL IndexedDB schemas MUST be defined here to prevent:
 * - NotFoundError on object stores
 * - Version conflicts between services
 * - Development HMR issues
 *
 * @version 2 - Initial centralized schema
 */

export const DB_NAME = 'ukom_exam_db' as const

/**
 * Database version - INCREMENT when adding/modifying stores
 *
 * Migration history:
 * - v1: Legacy (decentralized - deprecated)
 * - v2: Centralized schema with wawancara + seminar_makalah
 */
export const DB_VERSION = 2

/**
 * Object Store Names
 * Use this enum to reference stores throughout the app
 */
export const OBJECT_STORES = {
    WAWANCARA_ANSWERS: 'wawancara_answers',
    SEMINAR_MAKALAH_ANSWERS: 'seminar_makalah_answers',
    // Add future stores here and bump DB_VERSION
} as const

export type ObjectStoreName = (typeof OBJECT_STORES)[keyof typeof OBJECT_STORES]

/**
 * TTL Configuration
 */
export const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Object Store Configurations
 * Defines schema for each store
 */
export const STORE_CONFIGS: Record<
    ObjectStoreName,
    {
        keyPath: string
        indexes?: Array<{
            name: string
            keyPath: string | string[]
            options?: IDBIndexParameters
        }>
    }
> = {
    [OBJECT_STORES.WAWANCARA_ANSWERS]: {
        keyPath: 'key',
    },
    [OBJECT_STORES.SEMINAR_MAKALAH_ANSWERS]: {
        keyPath: 'key',
    },
}
