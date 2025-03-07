import express from 'express';
import db from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();

// Get all borrowed books
router.get('/', (req, res) => {
  db.all('SELECT * FROM BorrowedBooks', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Borrow book
router.post('/', authenticateJWT, (req, res) => {
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
            res.status(201).json({ id: this.lastID });
          }
        );
      }
    );
  });
});

// Return book
router.put('/:id/return', authenticateJWT, (req, res) => {
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
      res.status(200).json({ updated: this.changes });
    }
  );
});

// Delete borrowed book
router.delete('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM BorrowedBooks WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ deleted: this.changes });
  });
});

export default router;
