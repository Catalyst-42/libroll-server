import express from 'express';
import cors from 'cors';
import db from './database.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import userRoutes from './routes/users.js';
import borrowedBookRoutes from './routes/borrowedBooks.js';

const app = express();

app.use(cors());
app.use(express.json());

// Home
app.get('/', (req, res) => {
  res.json({message: "I'm fine... i guess."});
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

    // Borrowed books
    stats.borrowedBooksCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM BorrowedBooks', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Unreturned books
    stats.activeBorrowedBooksCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM BorrowedBooks WHERE status = "active"', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Returned books
    stats.inactiveBorrowedBooksCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM BorrowedBooks WHERE status = "returned"', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/borrowed-books', borrowedBookRoutes);

if (process.env.LOCAL == 'true') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
