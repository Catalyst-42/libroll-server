import express from 'express';

import getDb from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  const db = getDb();
  try {
    const users = await db`SELECT * FROM "Users" ORDER BY id DESC`;
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new user
router.post('/', authenticateJWT, async (req, res) => {
  const { first_name, last_name } = req.body;
  const db = getDb();
  try {
    const [user] = await db`
      INSERT INTO "Users" (first_name, last_name) 
      VALUES (${first_name}, ${last_name}) 
      RETURNING id
    `;
    res.status(201).json({ id: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name } = req.body;
  const db = getDb();
  try {
    const result = await db`
      UPDATE "Users" 
      SET first_name = ${first_name}, last_name = ${last_name} 
      WHERE id = ${id}
      RETURNING id
    `;
    res.status(200).json({ updated: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  try {
    const result = await db`
      DELETE FROM "Users" 
      WHERE id = ${id}
      RETURNING id
    `;
    res.status(200).json({ deleted: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
