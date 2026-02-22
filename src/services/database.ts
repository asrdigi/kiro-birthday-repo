/**
 * SQLite database schema and connection management
 * 
 * Provides database initialization, connection management, and schema creation
 * for tracking sent birthday messages.
 * 
 * Requirements: 5.1, 5.4
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Database connection instance
 */
let db: Database.Database | null = null;

/**
 * Default database file path
 */
const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'birthday_messenger.db');

/**
 * SQL schema for the sent_messages table
 * 
 * Schema:
 * - id: INTEGER PRIMARY KEY AUTOINCREMENT
 * - friend_id: TEXT NOT NULL (references Friend.id)
 * - year: INTEGER NOT NULL (calendar year)
 * - message_id: TEXT (WhatsApp message ID, nullable)
 * - message_content: TEXT (the actual message sent)
 * - timestamp: DATETIME NOT NULL (when the message was sent)
 * - delivery_status: TEXT NOT NULL ('sent', 'failed', or 'pending')
 * 
 * Constraints:
 * - UNIQUE(friend_id, year): Prevents duplicate messages per friend per year
 * 
 * Indexes:
 * - idx_friend_year: Index on (friend_id, year) for fast duplicate checking
 */
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  friend_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  message_id TEXT,
  message_content TEXT,
  timestamp DATETIME NOT NULL,
  delivery_status TEXT NOT NULL,
  UNIQUE(friend_id, year)
);

CREATE INDEX IF NOT EXISTS idx_friend_year ON sent_messages(friend_id, year);
`;

/**
 * Initializes the database connection and creates the schema
 * 
 * Creates the database file and data directory if they don't exist.
 * Executes the schema SQL to create tables and indexes.
 * 
 * @param dbPath - Optional custom database file path (defaults to data/birthday_messenger.db)
 * @returns Database instance
 * @throws Error if database initialization fails
 * 
 * Requirements: 5.1, 5.4
 */
export function initializeDatabase(dbPath: string = DEFAULT_DB_PATH): Database.Database {
  try {
    // Ensure the data directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create or open the database
    db = new Database(dbPath);
    
    // Enable foreign keys and WAL mode for better concurrency
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    
    // Execute schema creation
    db.exec(SCHEMA_SQL);
    
    return db;
  } catch (error) {
    throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the current database connection
 * 
 * @returns Database instance
 * @throws Error if database is not initialized
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Closes the database connection
 * 
 * Should be called during graceful shutdown to ensure all writes are flushed.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Checks if the database is initialized and connected
 * 
 * @returns true if database is initialized, false otherwise
 */
export function isDatabaseInitialized(): boolean {
  return db !== null && db.open;
}
