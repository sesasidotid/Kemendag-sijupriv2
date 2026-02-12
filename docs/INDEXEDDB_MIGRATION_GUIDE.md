# IndexedDB Centralized Architecture - Migration Guide

## 🎯 Problem Solved

**Before:** Multiple services opening the same database independently, causing `NotFoundError: object store not found`

**After:** Single source of truth for database schema, all stores declared upfront, safe concurrent access

---

## 📁 Architecture Overview

```
src/shared/indexeddb/
├── db.constants.ts      # Schema definition (DB_NAME, DB_VERSION, OBJECT_STORES)
├── db.opener.ts         # Centralized database opener with upgrade logic
├── generic-draft.service.ts  # Reusable base class for draft services
└── index.ts             # Barrel exports
```

---

## 🔧 For New Services

### Step 1: Add Store to Constants

Edit `src/shared/indexeddb/db.constants.ts`:

```typescript
export const DB_VERSION = 3 // ← INCREMENT THIS

export const OBJECT_STORES = {
    WAWANCARA_ANSWERS: 'wawancara_answers',
    SEMINAR_MAKALAH_ANSWERS: 'seminar_makalah_answers',
    NEW_STORE: 'new_store_name', // ← ADD HERE
} as const

export const STORE_CONFIGS: Record<ObjectStoreName, {...}> = {
    // ...existing...
    [OBJECT_STORES.NEW_STORE]: {
        keyPath: 'id',
        indexes: [
            { name: 'timestamp', keyPath: 'timestamp' }
        ]
    },
}
```

### Step 2: Create Service

```typescript
import { Injectable } from '@angular/core'
import { GenericDraftService } from '@/shared/indexeddb/generic-draft.service'
import { OBJECT_STORES } from '@/shared/indexeddb/db.constants'
import { MyAnswerType } from './models'

@Injectable({ providedIn: 'root' })
export class MyDraftService extends GenericDraftService<MyAnswerType> {
    constructor() {
        super(OBJECT_STORES.NEW_STORE)
    }
}
```

### Step 3: Use in Components

```typescript
export class MyComponent {
    constructor(private draftService: MyDraftService) {}

    async saveDraft() {
        await this.draftService.save(examId, participantId, answers)
    }

    async loadDraft() {
        const draft = await this.draftService.load(examId, participantId)
        if (draft) {
            this.answers = draft.answers
        }
    }
}
```

---

## ⚙️ Generic Draft Service API

All draft services inherit these methods:

### `save(examId, participantId, answers): Promise<void>`
Saves draft with automatic TTL (24 hours)

### `load(examId, participantId): Promise<DraftRecord<T> | null>`
Loads draft, returns `null` if expired or not found

### `remove(examId, participantId): Promise<void>`
Deletes draft immediately

### `listAll(): Promise<DraftRecord<T>[]>`
Returns all valid (non-expired) drafts

### `clearExpired(): Promise<number>`
Manually cleanup expired drafts, returns count deleted

### `exists(examId, participantId): Promise<boolean>`
Check if draft exists without loading

---

## 🚨 Version Bump Strategy

**When to increment `DB_VERSION`:**

1. ✅ Adding a new object store
2. ✅ Adding/removing indexes
3. ✅ Changing keyPath
4. ❌ NOT for data model changes (those are backward compatible)

**Migration process:**

1. Update `db.constants.ts`:
   - Add store to `OBJECT_STORES`
   - Add config to `STORE_CONFIGS`
   - **Increment `DB_VERSION`**

2. The `openDB()` function automatically:
   - Creates new stores on upgrade
   - Preserves existing data
   - Handles users on old versions gracefully

---

## 🛡️ Production Safety

### Existing Users
- Old data is **never deleted** during upgrades
- New stores are created only if missing
- Version changes trigger controlled upgrade path

### Development
- `ensureStoreExists()` detects schema mismatches
- In dev mode, auto-recovers by deleting corrupt DB
- Console logs show upgrade progress

### Concurrent Access
- Singleton `dbPromise` prevents race conditions
- `onversionchange` handler closes stale connections
- Safe for multiple services to instantiate simultaneously

---

## 🔍 Debugging

### Check Current Schema

```typescript
import { getDBInstance } from '@/shared/indexeddb'

const db = getDBInstance()
if (db) {
    console.log('Stores:', Array.from(db.objectStoreNames))
}
```

### Force Database Reset (Dev Only)

```typescript
import { deleteDatabase, resetConnection } from '@/shared/indexeddb'

await deleteDatabase()
resetConnection()
// Reload page
```

### Manual Inspection

1. Open DevTools → Application → IndexedDB
2. Find `ukom_exam_db`
3. Inspect object stores and version

---

## 🆚 Before & After Comparison

### Before (Problematic)

```typescript
// Each service independently opens DB
class ServiceA {
    private openDB() {
        const req = indexedDB.open('ukom_exam_db', 1)
        req.onupgradeneeded = () => {
            db.createObjectStore('store_A') // Only creates A
        }
    }
}

class ServiceB {
    private openDB() {
        const req = indexedDB.open('ukom_exam_db', 1) // Same version!
        req.onupgradeneeded = () => {
            db.createObjectStore('store_B') // Never fires if already v1
        }
    }
}
// Result: Only one store exists, other service crashes
```

### After (Centralized)

```typescript
// db.constants.ts
export const DB_VERSION = 2
export const OBJECT_STORES = {
    STORE_A: 'store_A',
    STORE_B: 'store_B',
}

// db.opener.ts creates BOTH stores on upgrade
request.onupgradeneeded = () => {
    Object.values(OBJECT_STORES).forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name) // Creates all stores
        }
    })
}

// Services just reference stores
class ServiceA extends GenericDraftService {
    constructor() { super(OBJECT_STORES.STORE_A) }
}

class ServiceB extends GenericDraftService {
    constructor() { super(OBJECT_STORES.STORE_B) }
}
```

---

## 📋 Checklist for Adding New Store

- [ ] Edit `db.constants.ts`: Add to `OBJECT_STORES`
- [ ] Edit `db.constants.ts`: Add to `STORE_CONFIGS`
- [ ] Edit `db.constants.ts`: **Increment `DB_VERSION`**
- [ ] Create service extending `GenericDraftService`
- [ ] Test in dev mode (verify no errors in console)
- [ ] Verify existing stores still work
- [ ] Check Application → IndexedDB in DevTools

---

## 🎓 Key Principles

1. **One Database, One Version** - All stores share schema
2. **Declare Upfront** - All stores defined in constants
3. **Version on Schema Change** - Bump version when adding stores
4. **Services Are Thin** - Just extend `GenericDraftService`
5. **Defensive Runtime** - `ensureStoreExists()` catches edge cases

---

## 🚀 Production Deployment

### First Deployment (v1 → v2)

Existing users have databases at v1 with partial stores:
- Some have only `wawancara_answers`
- Some have only `seminar_makalah_answers`
- Some have neither (new users)

**What happens:**
1. User loads app
2. `openUkomDB()` opens at v2
3. `onupgradeneeded` fires (v1 → v2)
4. Missing stores are created
5. Existing stores untouched
6. ✅ All features work immediately

### Future Deployments

Always follow the version bump strategy:
- Add store → bump version
- Deploy
- Automatic migration for all users

---

## ❓ FAQ

**Q: What if a user is offline during upgrade?**  
A: Next time they open the app, upgrade triggers normally.

**Q: Can I delete old stores?**  
A: Yes, but consider data migration. Users may have cached data.

**Q: What about indexes?**  
A: Define in `STORE_CONFIGS.indexes`, they're created automatically.

**Q: Performance impact?**  
A: Minimal. Database opens once per session, stores load instantly.

**Q: Hot reload breaks IndexedDB in dev?**  
A: `ensureStoreExists()` detects and auto-recovers by deleting DB.

---

## 🎉 Benefits

✅ **No more `NotFoundError`**  
✅ **Safe concurrent service initialization**  
✅ **HMR-resilient development**  
✅ **Production-safe migrations**  
✅ **Type-safe store references**  
✅ **DRY code with `GenericDraftService`**  
✅ **Centralized schema management**

---

## 📞 Support

If you encounter issues:

1. Check console for `[IndexedDB]` logs
2. Verify `DB_VERSION` was incremented
3. Inspect DevTools → Application → IndexedDB
4. Try manual reset (dev only): `deleteDatabase()`
5. Check all stores are in `OBJECT_STORES`

