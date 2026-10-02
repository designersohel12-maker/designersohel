# Firestore Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Any path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Path Variable Hardening**: All single-document operations (`get`, `create`, `update`, `delete`) validate document IDs using `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
3. **Strict Key & Volumetric Boundaries**:
   - `BestWork`: `hasAll` & `hasOnly` `['mediaUrl', 'mediaType', 'order', 'visibility', 'ownerId', 'createdAt', 'updatedAt']`. `mediaUrl` size 1..900000, `mediaType` in `['image', 'video']`, `order` is int, `visibility` in `['public', 'private']`.
   - `PortfolioProject`: `hasAll` & `hasOnly` `['category', 'mediaUrl', 'mediaType', 'order', 'visibility', 'ownerId', 'createdAt', 'updatedAt']`. `category` in `['motion', 'social', 'print']`.
   - `SiteProfile`: `hasAll` & `hasOnly` `['heroPhotoUrl', 'visibility', 'ownerId', 'createdAt', 'updatedAt']`.
4. **Identity & Verified Admin Enforcement**: Writes (`create`, `update`, `delete`) require a signed-in user with `request.auth.token.email_verified == true`, a verified admin identity (`designersohel12@gmail.com` or `soheldesigner90@gmail.com` or `/admins/$(request.auth.uid)`), and `incoming().ownerId == request.auth.uid`.
5. **Immutability & Temporal Integrity**: `ownerId` and `createdAt` cannot be modified during updates (`incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`). `createdAt` must equal `request.time` on `create`, and `updatedAt` must equal `request.time` on `create` and `update`.
6. **Query Enforcer on List Operations**: `allow list` is restricted to documents where `resource.data.visibility == 'public'` (or owned by the authenticated user `resource.data.ownerId == request.auth.uid`).

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Unauthenticated Write)**: Unauthenticated client attempts to create a `best_works` document. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Spoof)**: Authenticated user with `email: 'designersohel12@gmail.com'` but `email_verified: false` attempts to create a `portfolio_projects` document. -> `PERMISSION_DENIED`
3. **Payload 3 (Identity Spoofing)**: Authenticated admin attempts to create a `best_works` document with `ownerId: 'someone-else-uid'`. -> `PERMISSION_DENIED`
4. **Payload 4 (Shadow Field Injection on Create)**: Authenticated admin sends a valid `portfolio_projects` payload plus an undeclared field `isFeatured: true`. -> `PERMISSION_DENIED`
5. **Payload 5 (Shadow Field Injection on Update)**: Authenticated admin attempts to update `best_works` with an extra field `hacked: 'yes'`. -> `PERMISSION_DENIED`
6. **Payload 6 (Value Poisoning on Update)**: Authenticated admin updates `mediaType` in `best_works` to `'executable'` (outside enum `['image', 'video']`). -> `PERMISSION_DENIED`
7. **Payload 7 (Category Enum Bypass)**: Authenticated admin creates a `portfolio_projects` document with `category: 'unknown_category'`. -> `PERMISSION_DENIED`
8. **Payload 8 (Immortal Field Mutation - `createdAt`)**: Authenticated admin updates a `portfolio_projects` document and modifies `createdAt`. -> `PERMISSION_DENIED`
9. **Payload 9 (Immortal Field Mutation - `ownerId`)**: Authenticated admin updates a `best_works` document and changes `ownerId`. -> `PERMISSION_DENIED`
10. **Payload 10 (Forged Client Timestamp)**: Authenticated admin creates a `best_works` document with a past/future `createdAt` not matching `request.time`. -> `PERMISSION_DENIED`
11. **Payload 11 (ID Poisoning Attack)**: Client attempts to create a document with an invalid ID containing spaces or special characters. -> `PERMISSION_DENIED`
12. **Payload 12 (Unfiltered List Scraping of Private Docs)**: Unauthenticated client queries `portfolio_projects` where `visibility == 'private'`. -> `PERMISSION_DENIED`
