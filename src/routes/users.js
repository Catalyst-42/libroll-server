import express from 'express';

import db from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  db.all('SELECT * FROM Users', (err, rows) => {
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
