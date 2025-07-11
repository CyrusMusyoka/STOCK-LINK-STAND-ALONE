const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs'); // ✅ use bcryptjs instead of bcrypt
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'InventorySecrests'; // Replace with a strong secret in production

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [username, email, hashedPassword], function (err) {
      if (err) return res.status(500).json({ error: 'User already exists or DB error' });
      res.json({ success: true, userId: this.lastID });
    });
  } catch {
    res.status(500).json({ error: 'Hashing failed' });
  }
});

// Login a user
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ success: true, token });
  });
});

// Reset Password (requires email and new password)
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword)
    return res.status(400).json({ error: 'Missing fields' });

  const hashed = await bcrypt.hash(newPassword, 10);
  db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashed, email], function (err) {
    if (err || this.changes === 0)
      return res.status(500).json({ error: 'Failed to reset password' });

    res.json({ success: true, message: 'Password updated successfully' });
  });
});

module.exports = router;
