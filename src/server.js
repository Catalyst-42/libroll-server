import cors from 'cors';
import express from 'express';

import getDb, { initializeDb } from './database.js';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import userRoutes from './routes/users.js';
import borrowRoutes from './routes/borrows.js';

const app = express();

app.use(cors());
app.use(express.json());

// Home
app.get('/', (req, res) => {
  res.json({message: "Libroll server is alive!"});
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/database-health', async (req, res) => {
  try {
    const db = getDb();
    await db`SELECT 1`;  // Check connection to db
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Stats
app.get('/stats', async (req, res) => {
  try {
    const stats = {};
    const db = getDb();

    stats.booksCount = (await db`SELECT COUNT(*) as count FROM "Books"`)[0].count;
    stats.usersCount = (await db`SELECT COUNT(*) as count FROM "Users"`)[0].count;
    stats.borrowsCount = (await db`SELECT COUNT(*) as count FROM "Borrows"`)[0].count;
    stats.activeBorrowsCount = (await db`SELECT COUNT(*) as count FROM "Borrows" WHERE status = 'active'`)[0].count;
    stats.inactiveBorrowsCount = (await db`SELECT COUNT(*) as count FROM "Borrows" WHERE status = 'returned'`)[0].count;

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize database
initializeDb().then(() => {
  console.log('Database setup complete');
}).catch(err => {
  console.error('Failed to initialize database:', err.message);
});

// Connect routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/borrows', borrowRoutes);

// Run server on local, or export for Vercel
if (process.env.VERCEL == 'false' || process.env.LOCAL === undefined) {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
