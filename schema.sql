-- Internship Planter database schema for Cloudflare D1 (SQLite).
-- Apply with: npx wrangler d1 execute internship-planter-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  microsoft_oid TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_data TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS journals (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  journal_data TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS star_statements (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  star_data TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
