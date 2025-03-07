import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import db from '../database.js';
import { authenticateJWT } from '../utils.js';

const router = express.Router();
const secret_key = process.env.SECRET_KEY;

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
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
        secret_key,
        { expiresIn: '12h' }
      );

      res.status(201).json({ id: this.lastID, token });
    }
  );
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
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
        { expiresIn: '12h' }
      );
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error during login');
  }
});

router.get('/access-check', authenticateJWT, (req, res) => {
  res.json({ message: 'Protecred route works fine... i guess.' });
});

export default router;
