const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users'); // Ensure the path to the User model is correct
const router = express.Router();


// GET: Login Page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// POST: Login Handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Invalid username or password' });
    }

    // Create a payload for the token
    const payload = {
      id: user._id,
      role: user.role,
      username: user.username
    };

    // Sign the token with the secret
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in HTTP-only cookie
    res.cookie('authToken', token, { httpOnly: true });

    // Redirect based on user role
    switch (user.role) {
      case 'Admin':
        return res.redirect('/admin');
      case 'Manager':
        return res.redirect('/manager');
      case 'Engineer':
        return res.redirect('/engineer');
      default:
        return res.status(403).send({ message: 'Unauthorized role' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('authToken'); // Clear the authentication token cookie
  res.redirect('/users/login'); // Redirect to the login page
});

module.exports = router;
