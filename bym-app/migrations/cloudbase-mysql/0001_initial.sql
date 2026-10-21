-- Bym production schema for Tencent CloudBase MySQL.
-- All timestamps are Unix milliseconds to preserve the existing API contract.
-- `_id` is required by CloudBase data models and mirrors the domain `id`.

CREATE TABLE users (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  external_auth_subject VARCHAR(191) NULL UNIQUE,
  email_normalized VARCHAR(320) NOT NULL UNIQUE,
  email_verified_at BIGINT NULL,
  display_name VARCHAR(120) NOT NULL,
  avatar_url TEXT NOT NULL,
  bio VARCHAR(500) NOT NULL DEFAULT '',
  profile_completed_at BIGINT NULL,
  account_status VARCHAR(24) NOT NULL DEFAULT 'active',
  identity_status VARCHAR(24) NOT NULL DEFAULT 'unverified',
  deleted_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  INDEX idx_users_account_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE publications (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  owner_user_id VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  handle VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  INDEX idx_publications_status (status),
  CONSTRAINT fk_publications_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  publication_id VARCHAR(64) NOT NULL,
  author_user_id VARCHAR(64) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  title VARCHAR(500) NOT NULL DEFAULT '无标题',
  subtitle TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  body_document LONGTEXT NOT NULL,
  body_text LONGTEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  send_email TINYINT(1) NOT NULL DEFAULT 0,
  published_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE KEY idx_articles_publication_slug (publication_id, slug),
  INDEX idx_articles_publication_status_published (publication_id, status, published_at),
  INDEX idx_articles_author_status (author_user_id, status),
  CONSTRAINT fk_articles_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
  CONSTRAINT fk_articles_author FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE article_revisions (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  article_id VARCHAR(64) NOT NULL,
  editor_user_id VARCHAR(64) NOT NULL,
  title VARCHAR(500) NOT NULL,
  subtitle TEXT NOT NULL,
  body_document LONGTEXT NOT NULL,
  body_text LONGTEXT NOT NULL,
  reason VARCHAR(64) NOT NULL DEFAULT 'autosave',
  created_at BIGINT NOT NULL,
  INDEX idx_article_revisions_article_created (article_id, created_at),
  CONSTRAINT fk_revisions_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_revisions_editor FOREIGN KEY (editor_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subscriptions (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  subscriber_user_id VARCHAR(64) NOT NULL,
  publication_id VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  email_delivery TINYINT(1) NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE KEY idx_subscriptions_user_publication (subscriber_user_id, publication_id),
  INDEX idx_subscriptions_publication_status (publication_id, status),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (subscriber_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscriptions_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inbox_items (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  article_id VARCHAR(64) NOT NULL,
  delivered_at BIGINT NOT NULL,
  read_at BIGINT NULL,
  archived_at BIGINT NULL,
  UNIQUE KEY idx_inbox_items_user_article (user_id, article_id),
  INDEX idx_inbox_items_user_delivered (user_id, delivered_at),
  CONSTRAINT fk_inbox_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_inbox_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saved_articles (
  _id VARCHAR(140) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  article_id VARCHAR(64) NOT NULL,
  saved_at BIGINT NOT NULL,
  UNIQUE KEY idx_saved_articles_user_article (user_id, article_id),
  INDEX idx_saved_articles_user_saved (user_id, saved_at),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reading_progress (
  _id VARCHAR(140) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  article_id VARCHAR(64) NOT NULL,
  percent INT NOT NULL DEFAULT 0,
  position TEXT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE KEY idx_reading_progress_user_article (user_id, article_id),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE outbox_events (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  event_type VARCHAR(120) NOT NULL,
  aggregate_type VARCHAR(120) NOT NULL,
  aggregate_id VARCHAR(64) NOT NULL,
  payload LONGTEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  attempt_count INT NOT NULL DEFAULT 0,
  available_at BIGINT NOT NULL,
  processed_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_outbox_events_status_available (status, available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consent_records (
  _id VARCHAR(64) PRIMARY KEY,
  id VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  document_type VARCHAR(120) NOT NULL,
  document_version VARCHAR(64) NOT NULL,
  locale VARCHAR(24) NOT NULL DEFAULT 'zh-CN',
  accepted_at BIGINT NOT NULL,
  INDEX idx_consent_records_user_document (user_id, document_type),
  CONSTRAINT fk_consent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
