import express from 'express';

import db from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  db.all('SELECT * FROM Users ORDER BY id DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new user
router.post('/', authenticateJWT, (req, res) => {
  const { first_name, last_name } = req.body;
  db.run(
    'INSERT INTO Users (first_name, last_name) VALUES (?, ?)',
    [first_name, last_name],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update user
router.put('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { first_name, last_name } = req.body;
  db.run(
    'UPDATE Users SET first_name = ?, last_name = ? WHERE id = ?',
    [first_name, last_name, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json({ updated: this.changes });
    }
  );
});

// Delete user
router.delete('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Users WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ deleted: this.changes });
  });
});

export default router;
