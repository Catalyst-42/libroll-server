import { Database } from '@sqlitecloud/drivers';
import sqlite3 from 'sqlite3';

let db;

// Use local database or remote
if (process.env.LOCAL === 'true' || process.env.LOCAL === undefined) {
  db = new sqlite3.Database('./databases/libroll.db');

  db.serialize(() => {
    // Books
    db.run(`
      CREATE TABLE IF NOT EXISTS Books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        total_count INTEGER NOT NULL
      )
    `);
  
    // Users
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
      )
    `);
  
    // Borrows
    db.run(`
      CREATE TABLE IF NOT EXISTS Borrows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        borrow_date TEXT NOT NULL,
        return_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        FOREIGN KEY (book_id) REFERENCES Books(id),
        FOREIGN KEY (user_id) REFERENCES Users(id)
      );
    `);

    // Superusers
    db.run(`
      CREATE TABLE IF NOT EXISTS Superusers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);

    console.log('Connected to the local database');
  });
} else {
  db = new Database(process.env.DATABASE_URL, (error) => {
    if (error) {
      console.log('Error during the connection', error);
    } else {
      console.log('Connected to the remote database');
    }
  });
}

export default db;
