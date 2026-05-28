-- ParaHub V1.1 terms/privacy acceptance fields.
-- Run this once on existing D1 databases that were created before the terms system was added.

ALTER TABLE users ADD COLUMN terms_accepted INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN accepted_terms_version TEXT;
ALTER TABLE users ADD COLUMN accepted_privacy_version TEXT;
ALTER TABLE users ADD COLUMN terms_accepted_at TEXT;
ALTER TABLE users ADD COLUMN terms_accepted_by_user_id TEXT;
ALTER TABLE users ADD COLUMN terms_accepted_by_name TEXT;
ALTER TABLE users ADD COLUMN credit_preference TEXT NOT NULL DEFAULT 'Anonymous investigator';
ALTER TABLE users ADD COLUMN custom_credit_name TEXT;
