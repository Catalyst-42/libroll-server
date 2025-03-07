import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from './database.js';

const secret_key = process.env.SECRET_KEY;

// Check tokens
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secret_key, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Update passwords to hashed
export const updatePasswordsToHashed = async () => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, password FROM Superusers', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE Superusers SET password = ? WHERE id = ?',
          [hashedPassword, user.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('All passwords have been updated to hashed passwords.');
  } catch (err) {
    console.error('Error updating passwords to hashed:', err);
  }
};
