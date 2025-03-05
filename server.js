import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './database.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Home
app.get('/', (req, res) => {
  res.send("I'm fine... i guess.");
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

// Books

// Get all books
app.get('/books', (req, res) => {
  db.all('SELECT * FROM Books', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new book
app.post('/books', (req, res) => {
  const { title, author, total_count } = req.body;
  db.run(
    'INSERT INTO Books (title, author, total_count) VALUES (?, ?, ?)',
    [title, author, total_count],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Delete book
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Books WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Users

// Get all users
app.get('/users', (req, res) => {
  db.all('SELECT * FROM Users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new user
app.post('/users', (req, res) => {
  const { first_name, last_name } = req.body;
  db.run(
    'INSERT INTO Users (first_name, last_name) VALUES (?, ?)',
    [first_name, last_name],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Delete user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Users WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Borrowed books

// Get all borrowed books
app.get('/borrowed-books', (req, res) => {
  db.all('SELECT * FROM BorrowedBooks', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Borrow book
app.post('/borrowed-books', (req, res) => {
  const { book_id, user_id, borrow_date, return_date } = req.body;

  // Check availability
  db.get('SELECT total_count FROM Books WHERE id = ?', [book_id], (err, book) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    db.get(
      'SELECT COUNT(*) as count FROM BorrowedBooks WHERE book_id = ? AND status = "active"',
      [book_id],
      (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (result.count >= book.total_count) {
          res.status(400).json({ error: 'No available books' });
          return;
        }

        // Borrow
        db.run(
          'INSERT INTO BorrowedBooks (book_id, user_id, borrow_date, return_date, status) VALUES (?, ?, ?, ?, "active")',
          [book_id, user_id, borrow_date, return_date],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: this.lastID });
          }
        );
      }
    );
  });
});

// Return book
app.put('/borrowed-books/:id/return', (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE BorrowedBooks SET status = "returned" WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Record not found or book already returned' });
        return;
      }
      res.json({ updated: this.changes });
    }
  );
});

// Delete borrowed book
app.delete('/borrowed-books/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM BorrowedBooks WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

if (process.env.LOCAL == 'true') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
