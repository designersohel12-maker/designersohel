/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 * Verifies that all 12 adversarial payloads defined in security_spec.md return PERMISSION_DENIED.
 */

export interface DirtyPayloadTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  auth: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const dirtyDozenTests: DirtyPayloadTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write',
    collection: 'best_works',
    docId: 'work_1',
    operation: 'create',
    auth: null,
    payload: {
      mediaUrl: 'https://example.com/a.jpg',
      mediaType: 'image',
      order: 1,
      visibility: 'public',
      ownerId: 'anon',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoof',
    collection: 'portfolio_projects',
    docId: 'proj_1',
    operation: 'create',
    auth: {
      uid: 'user_1',
      email: 'designersohel12@gmail.com',
      email_verified: false,
    },
    payload: {
      category: 'motion',
      mediaUrl: 'https://example.com/a.mp4',
      mediaType: 'video',
      order: 1,
      visibility: 'public',
      ownerId: 'user_1',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity Spoofing (Mismatched ownerId)',
    collection: 'best_works',
    docId: 'work_2',
    operation: 'create',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      mediaUrl: 'https://example.com/a.jpg',
      mediaType: 'image',
      order: 1,
      visibility: 'public',
      ownerId: 'spoofed_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Create',
    collection: 'portfolio_projects',
    docId: 'proj_2',
    operation: 'create',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      category: 'social',
      mediaUrl: 'https://example.com/a.jpg',
      mediaType: 'image',
      order: 1,
      visibility: 'public',
      ownerId: 'admin_uid',
      isFeatured: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow Field Injection on Update',
    collection: 'best_works',
    docId: 'work_1',
    operation: 'update',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      mediaUrl: 'https://example.com/b.jpg',
      hackedField: 'true',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Value Poisoning on Update (Invalid Enum)',
    collection: 'best_works',
    docId: 'work_1',
    operation: 'update',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      mediaType: 'executable',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Category Enum Bypass',
    collection: 'portfolio_projects',
    docId: 'proj_3',
    operation: 'create',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      category: 'invalid_cat',
      mediaUrl: 'https://example.com/a.jpg',
      mediaType: 'image',
      order: 1,
      visibility: 'public',
      ownerId: 'admin_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immortal Field Mutation (createdAt)',
    collection: 'portfolio_projects',
    docId: 'proj_1',
    operation: 'update',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Immortal Field Mutation (ownerId)',
    collection: 'best_works',
    docId: 'work_1',
    operation: 'update',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      ownerId: 'new_owner_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Forged Client Timestamp',
    collection: 'best_works',
    docId: 'work_3',
    operation: 'create',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      mediaUrl: 'https://example.com/a.jpg',
      mediaType: 'image',
      order: 1,
      visibility: 'public',
      ownerId: 'admin_uid',
      createdAt: '1999-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'ID Poisoning Attack',
    collection: 'best_works',
    docId: 'invalid id with spaces!@#',
    operation: 'create',
    auth: {
      uid: 'admin_uid',
      email: 'designersohel12@gmail.com',
      email_verified: true,
    },
    payload: {
      mediaUrl: 'https://example.com/a.jpg',
      mediaType: 'image',
      order: 1,
      visibility: 'public',
      ownerId: 'admin_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Private Document Read by Non-Owner',
    collection: 'portfolio_projects',
    docId: 'private_proj_1',
    operation: 'get',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
];
