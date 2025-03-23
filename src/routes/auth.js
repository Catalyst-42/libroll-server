import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';

import getDb from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();
const secret_key = process.env.SECRET_KEY;

// Check secure routes
router.get('/access-check', authenticateJWT, (req, res) => {
  res.json({ message: 'Today is a good day, cuz jwt works fine!' });
});

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = getDb();
  db.run(
    'INSERT INTO Superusers (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const token = jwt.sign(
        { id: this.lastID, username },
        secret_key
      );

      res.status(201).json({ id: this.lastID, token });
    }
  );
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM Superusers WHERE username = ?',
        [username],
        (err, user) => {
          if (err) reject(err);
          else resolve(user);
        }
      );
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        secret_key,
      );
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error during login: ' + error.message);
  }
});

export default router;
