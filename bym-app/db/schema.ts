import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
};

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    externalAuthSubject: text('external_auth_subject'),
    emailNormalized: text('email_normalized').notNull(),
    emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp_ms' }),
    displayName: text('display_name').notNull(),
    avatarUrl: text('avatar_url').notNull().default(''),
    bio: text('bio').notNull().default(''),
    profileCompletedAt: integer('profile_completed_at', { mode: 'timestamp_ms' }),
    accountStatus: text('account_status', {
      enum: ['active', 'restricted', 'suspended', 'deleted'],
    }).notNull().default('active'),
    identityStatus: text('identity_status', {
      enum: ['unverified', 'pending', 'verified', 'rejected'],
    }).notNull().default('unverified'),
    deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('idx_users_email_normalized').on(table.emailNormalized),
    uniqueIndex('idx_users_external_auth_subject').on(table.externalAuthSubject),
    index('idx_users_account_status').on(table.accountStatus),
  ],
);

export const publications = sqliteTable(
  'publications',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    handle: text('handle').notNull(),
    description: text('description').notNull().default(''),
    status: text('status', { enum: ['draft', 'active', 'paused', 'closed'] }).notNull().default('draft'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('idx_publications_handle').on(table.handle),
    uniqueIndex('idx_publications_owner_user_id').on(table.ownerUserId),
    index('idx_publications_status').on(table.status),
  ],
);

export const articles = sqliteTable(
  'articles',
  {
    id: text('id').primaryKey(),
    publicationId: text('publication_id').notNull().references(() => publications.id, { onDelete: 'cascade' }),
    authorUserId: text('author_user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    title: text('title').notNull().default('无标题'),
    subtitle: text('subtitle').notNull().default(''),
    coverImageUrl: text('cover_image_url').notNull().default(''),
    bodyDocument: text('body_document').notNull().default('{}'),
    bodyText: text('body_text').notNull().default(''),
    status: text('status', {
      enum: ['draft', 'scheduled', 'published', 'unpublished', 'removed'],
    }).notNull().default('draft'),
    sendEmail: integer('send_email', { mode: 'boolean' }).notNull().default(false),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('idx_articles_publication_slug').on(table.publicationId, table.slug),
    index('idx_articles_publication_status_published').on(table.publicationId, table.status, table.publishedAt),
    index('idx_articles_author_status').on(table.authorUserId, table.status),
  ],
);

export const articleRevisions = sqliteTable(
  'article_revisions',
  {
    id: text('id').primaryKey(),
    articleId: text('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
    editorUserId: text('editor_user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull().default(''),
    bodyDocument: text('body_document').notNull(),
    bodyText: text('body_text').notNull(),
    reason: text('reason').notNull().default('autosave'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('idx_article_revisions_article_created').on(table.articleId, table.createdAt)],
);

export const subscriptions = sqliteTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    subscriberUserId: text('subscriber_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    publicationId: text('publication_id').notNull().references(() => publications.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['active', 'unsubscribed'] }).notNull().default('active'),
    emailDelivery: integer('email_delivery', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('idx_subscriptions_user_publication').on(table.subscriberUserId, table.publicationId),
    index('idx_subscriptions_publication_status').on(table.publicationId, table.status),
  ],
);

export const inboxItems = sqliteTable(
  'inbox_items',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    articleId: text('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
    deliveredAt: integer('delivered_at', { mode: 'timestamp_ms' }).notNull(),
    readAt: integer('read_at', { mode: 'timestamp_ms' }),
    archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    uniqueIndex('idx_inbox_items_user_article').on(table.userId, table.articleId),
    index('idx_inbox_items_user_delivered').on(table.userId, table.deliveredAt),
  ],
);

export const savedArticles = sqliteTable(
  'saved_articles',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    articleId: text('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
    savedAt: integer('saved_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('idx_saved_articles_user_article').on(table.userId, table.articleId),
    index('idx_saved_articles_user_saved').on(table.userId, table.savedAt),
  ],
);

export const readingProgress = sqliteTable(
  'reading_progress',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    articleId: text('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
    percent: integer('percent').notNull().default(0),
    position: text('position').notNull().default(''),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [uniqueIndex('idx_reading_progress_user_article').on(table.userId, table.articleId)],
);

export const outboxEvents = sqliteTable(
  'outbox_events',
  {
    id: text('id').primaryKey(),
    eventType: text('event_type').notNull(),
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: text('aggregate_id').notNull(),
    payload: text('payload').notNull(),
    status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
    attemptCount: integer('attempt_count').notNull().default(0),
    availableAt: integer('available_at', { mode: 'timestamp_ms' }).notNull(),
    processedAt: integer('processed_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('idx_outbox_events_status_available').on(table.status, table.availableAt)],
);

export const consentRecords = sqliteTable(
  'consent_records',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    documentType: text('document_type').notNull(),
    documentVersion: text('document_version').notNull(),
    locale: text('locale').notNull().default('zh-CN'),
    acceptedAt: integer('accepted_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('idx_consent_records_user_document').on(table.userId, table.documentType)],
);
