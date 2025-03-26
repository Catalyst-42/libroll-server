import { Database } from '@sqlitecloud/drivers';
import sqlite3 from 'sqlite3';

let localDb;
let remoteDb;

const connectRemoteDb = () => {
  try {
    remoteDb = new Database(process.env.DATABASE_URL, (error) => {
      if (error) {
        console.error('Error during the connection', error);
      } else {
        console.log('Connected to the remote database');
      }
    });

    remoteDb.on('error', (err) => {
      console.error('Database connection error:', err);
      if (err.code === 'ECONNRESET') {
        console.log('Attempting to reconnect to the remote database...');
        setTimeout(connectRemoteDb, 5000); // Retry connection after 5 seconds
      }
    });
  } catch (err) {
    console.error('Unexpected error while connecting to the remote database:', err);
    setTimeout(connectRemoteDb, 5000); // Retry connection after 5 seconds
  }
};

if (process.env.LOCAL === 'true' || process.env.LOCAL === undefined) {
  localDb = new sqlite3.Database('./databases/libroll.db');

  localDb.serialize(() => {
    // Books
    localDb.run(`
      CREATE TABLE IF NOT EXISTS Books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        total_count INTEGER NOT NULL
      )
    `);
  
    // Users
    localDb.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
      )
    `);
  
    // Borrows
    localDb.run(`
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
    localDb.run(`
      CREATE TABLE IF NOT EXISTS Superusers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);

    console.log('Connected to the local database');
  });
} else {
  connectRemoteDb();
}

export const getDb = () => {
  if (process.env.LOCAL !== 'true' && process.env.LOCAL !== undefined) {
    return remoteDb;
  }

  return localDb;
};

export default getDb;
