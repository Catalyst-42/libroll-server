import jwt from 'jsonwebtoken';

const secret_key = process.env.SECRET_KEY || ':(';

// Validate token
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
