PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'investigator', 'viewer')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  terms_accepted INTEGER NOT NULL DEFAULT 0,
  accepted_terms_version TEXT,
  accepted_privacy_version TEXT,
  terms_accepted_at TEXT,
  terms_accepted_by_user_id TEXT,
  terms_accepted_by_name TEXT,
  credit_preference TEXT NOT NULL DEFAULT 'Anonymous investigator' CHECK (credit_preference IN ('Anonymous investigator', 'First name only', 'Full name', 'Custom credit name', 'Do not publicly credit me')),
  custom_credit_name TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investigations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT,
  date TEXT,
  lead TEXT,
  owner_id TEXT NOT NULL,
  base_room_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS investigation_members (
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'investigator', 'viewer')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (investigation_id, user_id),
  FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (investigation_id, name),
  FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  note TEXT,
  classification TEXT NOT NULL DEFAULT 'Unreviewed',
  media_key TEXT,
  media_name TEXT,
  media_type TEXT,
  media_size INTEGER,
  media_data TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS control_checks (
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL,
  label TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON investigation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_investigation ON investigation_members(investigation_id);
CREATE INDEX IF NOT EXISTS idx_rooms_investigation ON rooms(investigation_id);
CREATE INDEX IF NOT EXISTS idx_events_investigation ON events(investigation_id);
CREATE INDEX IF NOT EXISTS idx_controls_investigation ON control_checks(investigation_id);
