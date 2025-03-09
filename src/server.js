import cors from 'cors';
import express from 'express';

import db from './database.js';

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

// Stats
app.get('/stats', async (req, res) => {
  try {
    const stats = {};

    // Book count
    stats.booksCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Books', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // User count
    stats.usersCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Users', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Borrows
    stats.borrowsCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Borrows', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Unreturned books
    stats.activeBorrowsCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Borrows WHERE status = "active"', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Returned books
    stats.inactiveBorrowsCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Borrows WHERE status = "returned"', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/borrows', borrowRoutes);

// Run server on local, or export for Vercel
if (process.env.LOCAL == 'true' || process.env.LOCAL === undefined) {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
