const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Root route: show welcome if logged in, else redirect to login
router.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/welcome');
  }
  res.redirect('/login');
});

// Registration route
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, repeatPassword } = req.body;
  if (!firstName || !lastName || !email || !password || !repeatPassword) {
    return res.render('register', { error: 'All fields are required.' });
  }
  if (password !== repeatPassword) {
    return res.render('register', { error: 'Passwords do not match.' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'User already exists.' });
    }
    const user = new User({ firstName, lastName, email, password });
    await user.save();
    req.session.userId = user._id;
    req.session.firstName = user.firstName;
    res.redirect('/welcome');
  } catch (err) {
    res.render('register', { error: 'Registration failed.' });
  }
});

// Login route
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password, stayLoggedIn } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'All fields are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Invalid credentials.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Invalid credentials.' });
    }
    req.session.userId = user._id;
    req.session.firstName = user.firstName;
    if (stayLoggedIn) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = false; // Session cookie
    }
    res.redirect('/welcome');
  } catch (err) {
    res.render('login', { error: 'Login failed.' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;