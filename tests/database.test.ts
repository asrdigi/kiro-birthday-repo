/**
 * Unit tests for database schema and connection management
 * 
 * Tests database initialization, schema creation, and connection management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase, getDatabase, closeDatabase, isDatabaseInitialized } from '../src/services/database';
import fs from 'fs';
import path from 'path';

describe('Database Schema and Connection', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'test_birthday_messenger.db');
  const testDbDir = path.dirname(testDbPath);

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (fs.existsSync(`${testDbPath}-shm`)) {
      fs.unlinkSync(`${testDbPath}-shm`);
    }
    if (fs.existsSync(`${testDbPath}-wal`)) {
      fs.unlinkSync(`${testDbPath}-wal`);
    }
  });

  afterEach(() => {
    // Close database connection
    closeDatabase();
    
    // Clean up test database files
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (fs.existsSync(`${testDbPath}-shm`)) {
      fs.unlinkSync(`${testDbPath}-shm`);
    }
    if (fs.existsSync(`${testDbPath}-wal`)) {
      fs.unlinkSync(`${testDbPath}-wal`);
    }
  });

  it('should initialize database and create schema', () => {
    const db = initializeDatabase(testDbPath);
    
    expect(db).toBeDefined();
    expect(isDatabaseInitialized()).toBe(true);
    
    // Verify the sent_messages table exists
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sent_messages'").get();
    expect(tableInfo).toBeDefined();
    expect((tableInfo as any).name).toBe('sent_messages');
  });

  it('should create the data directory if it does not exist', () => {
    // Remove the data directory if it exists
    if (fs.existsSync(testDbDir)) {
      fs.rmSync(testDbDir, { recursive: true });
    }
    
    initializeDatabase(testDbPath);
    
    expect(fs.existsSync(testDbDir)).toBe(true);
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it('should create the correct table schema with all columns', () => {
    const db = initializeDatabase(testDbPath);
    
    // Get table schema
    const columns = db.prepare("PRAGMA table_info(sent_messages)").all() as any[];
    
    const columnNames = columns.map(col => col.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('friend_id');
    expect(columnNames).toContain('year');
    expect(columnNames).toContain('message_id');
    expect(columnNames).toContain('message_content');
    expect(columnNames).toContain('timestamp');
    expect(columnNames).toContain('delivery_status');
    
    // Verify id is PRIMARY KEY
    const idColumn = columns.find(col => col.name === 'id');
    expect(idColumn.pk).toBe(1);
  });

  it('should create the unique constraint on (friend_id, year)', () => {
    const db = initializeDatabase(testDbPath);
    
    // Insert a test record
    db.prepare(`
      INSERT INTO sent_messages (friend_id, year, message_content, timestamp, delivery_status)
      VALUES (?, ?, ?, ?, ?)
    `).run('friend1', 2024, 'Happy Birthday!', new Date().toISOString(), 'sent');
    
    // Try to insert a duplicate (same friend_id and year)
    expect(() => {
      db.prepare(`
        INSERT INTO sent_messages (friend_id, year, message_content, timestamp, delivery_status)
        VALUES (?, ?, ?, ?, ?)
      `).run('friend1', 2024, 'Another message', new Date().toISOString(), 'sent');
    }).toThrow();
  });

  it('should create the index on (friend_id, year)', () => {
    const db = initializeDatabase(testDbPath);
    
    // Verify the index exists
    const indexInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_friend_year'").get();
    expect(indexInfo).toBeDefined();
    expect((indexInfo as any).name).toBe('idx_friend_year');
  });

  it('should return the database instance from getDatabase()', () => {
    initializeDatabase(testDbPath);
    
    const db = getDatabase();
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
  });

  it('should throw error when getDatabase() is called before initialization', () => {
    expect(() => getDatabase()).toThrow('Database not initialized');
  });

  it('should close the database connection', () => {
    initializeDatabase(testDbPath);
    expect(isDatabaseInitialized()).toBe(true);
    
    closeDatabase();
    expect(isDatabaseInitialized()).toBe(false);
  });

  it('should handle multiple initializations gracefully', () => {
    const db1 = initializeDatabase(testDbPath);
    const db2 = initializeDatabase(testDbPath);
    
    expect(db1).toBeDefined();
    expect(db2).toBeDefined();
    expect(isDatabaseInitialized()).toBe(true);
  });

  it('should enable WAL mode for better concurrency', () => {
    const db = initializeDatabase(testDbPath);
    
    const journalMode = db.pragma('journal_mode', { simple: true });
    expect(journalMode).toBe('wal');
  });

  it('should enable foreign keys', () => {
    const db = initializeDatabase(testDbPath);
    
    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    expect(foreignKeys).toBe(1);
  });
});
