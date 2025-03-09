import express from 'express';

import db from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();

// Get all books
router.get('/', (req, res) => {
  db.all('SELECT * FROM Books', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new book
router.post('/', authenticateJWT, (req, res) => {
  const { title, author, total_count } = req.body;
  db.run(
    'INSERT INTO Books (title, author, total_count) VALUES (?, ?, ?)',
    [title, author, total_count],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update book
router.put('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { title, author, total_count } = req.body;
  db.run(
    'UPDATE Books SET title = ?, author = ?, total_count = ? WHERE id = ?',
    [title, author, total_count, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json({ updated: this.changes });
    }
  );
});

// Delete book
router.delete('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Books WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ deleted: this.changes });
  });
});

export default router;
