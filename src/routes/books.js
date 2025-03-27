import express from 'express';

import getDb from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  const db = getDb();
  try {
    const books = await db`SELECT * FROM "Books" ORDER BY id DESC`;
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new book
router.post('/', authenticateJWT, async (req, res) => {
  const { title, author, total_count } = req.body;
  const db = getDb();
  try {
    const [book] = await db`
      INSERT INTO "Books" (title, author, total_count) 
      VALUES (${title}, ${author}, ${total_count}) 
      RETURNING id
    `;
    res.status(201).json({ id: book.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update book
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { title, author, total_count } = req.body;
  const db = getDb();
  try {
    const result = await db`
      UPDATE "Books" 
      SET title = ${title}, author = ${author}, total_count = ${total_count} 
      WHERE id = ${id}
      RETURNING id
    `;
    res.status(200).json({ updated: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete book
router.delete('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  try {
    const result = await db`
      DELETE FROM "Books" 
      WHERE id = ${id}
      RETURNING id
    `;
    res.status(200).json({ deleted: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
