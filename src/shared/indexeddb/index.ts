/**
 * Barrel export for centralized IndexedDB utilities
 */

export { DB_NAME, DB_VERSION, OBJECT_STORES, TTL_MS, STORE_CONFIGS } from './db.constants'
export type { ObjectStoreName } from './db.constants'

export {
    openUkomDB,
    ensureStoreExists,
    createTransaction,
    deleteDatabase,
    getDBInstance,
    resetConnection,
} from './db.opener'

export { GenericDraftService } from './generic-draft.service'
export type { DraftRecord } from './generic-draft.service'

