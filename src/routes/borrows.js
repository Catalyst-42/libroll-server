import express from 'express';

import getDb from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();

// Get all borrowed books
router.get('/', async (req, res) => {
  const db = getDb();
  try {
    const borrows = await db`SELECT * FROM "Borrows" ORDER BY id DESC`;
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrow book
router.post('/', authenticateJWT, async (req, res) => {
  const { book_id, user_id, borrow_date, return_date } = req.body;
  const db = getDb();
  try {
    const [book] = await db`SELECT total_count FROM "Books" WHERE id = ${book_id}`;
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const [{ count }] = await db`
      SELECT COUNT(*) as count 
      FROM "Borrows" 
      WHERE book_id = ${book_id} AND status = 'active'
    `;

    if (count >= book.total_count) {
      return res.status(400).json({ error: 'No available books' });
    }

    const [borrow] = await db`
      INSERT INTO "Borrows" (book_id, user_id, borrow_date, return_date, status) 
      VALUES (${book_id}, ${user_id}, ${borrow_date}, ${return_date}, 'active') 
      RETURNING id
    `;
    res.status(201).json({ id: borrow.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update borrow details
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { book_id, user_id, borrow_date, return_date, status } = req.body;
  const db = getDb();
  try {
    const result = await db`
      UPDATE "Borrows" 
      SET book_id = ${book_id}, user_id = ${user_id}, borrow_date = ${borrow_date}, 
          return_date = ${return_date}, status = ${status} 
      WHERE id = ${id}
      RETURNING id
    `;
    res.status(200).json({ updated: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return book
router.put('/:id/return', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  try {
    const result = await db`
      UPDATE "Borrows" 
      SET status = 'returned' 
      WHERE id = ${id}
      RETURNING id
    `;
    res.status(200).json({ updated: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete borrowed book
router.delete('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  try {
    const result = await db`
      DELETE FROM "Borrows" 
      WHERE id = ${id}
      RETURNING id
    `;
    res.status(200).json({ deleted: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
