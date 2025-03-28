import postgres from 'postgres';

let sql;

const connectionString = (
  process.env.LOCAL !== 'false'
  ? process.env.LOCAL_DATABASE_URL
  : process.env.REMOTE_DATABASE_URL
);

sql = postgres(connectionString, { 
  ssl: process.env.LOCAL === 'false'
});

console.log(`Connected to the ${
  process.env.LOCAL !== 'false' ? 'local' : 'remote'
} PostgreSQL database`);

export const getDb = () => sql;

export const initializeDb = async () => {
  const db = getDb();
  try {
    await db`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS "Books" (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        total_count INT NOT NULL
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS "Borrows" (
        id SERIAL PRIMARY KEY,
        book_id INT REFERENCES "Books"(id),
        user_id INT REFERENCES "Users"(id),
        borrow_date DATE NOT NULL,
        return_date DATE,
        status TEXT NOT NULL
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS "Superusers" (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `;

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

export default getDb;
