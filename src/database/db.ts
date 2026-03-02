import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { config } from '../config';
import logger from '../utils/logger';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function initDatabase(): Promise<void> {
  db = await open({
    filename: config.database.path,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS watched_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      token_address TEXT NOT NULL,
      chain TEXT NOT NULL DEFAULT 'eth',
      threshold_usd INTEGER DEFAULT 100000,
      is_premium INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(guild_id, token_address)
    );

    CREATE TABLE IF NOT EXISTS alert_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      token_address TEXT NOT NULL,
      from_address TEXT,
      to_address TEXT,
      amount_tokens TEXT,
      amount_usd REAL,
      chain TEXT,
      alert_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      alert_channel_id TEXT,
      is_premium INTEGER DEFAULT 0,
      premium_expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_watched_tokens_guild ON watched_tokens(guild_id);
    CREATE INDEX IF NOT EXISTS idx_alert_history_guild ON alert_history(guild_id);
    CREATE INDEX IF NOT EXISTS idx_alert_history_tx ON alert_history(tx_hash);
  `);

  logger.info('Database initialized successfully');
}

export function getDb(): Database<sqlite3.Database, sqlite3.Statement> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export default { initDatabase, getDb };