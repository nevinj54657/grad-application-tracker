const bcrypt = require('bcrypt');
const prisma = require('../services/prisma');
const { isNonEmptyString, isValidEmail, isValidPassword } = require('../utils/validators');
const { toSafeUser } = require('../utils/sanitize');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  if (!isNonEmptyString(name, { maxLength: 100 })) {
    return res.status(400).json({ error: 'Please enter your name.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase(), passwordHash },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    throw err;
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
    req.session.userId = user.id;
    res.status(201).json({ message: 'Account created successfully', user: toSafeUser(user) });
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Please enter your email and password.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  const genericError = { error: 'Unable to log in. Please check your email and password.' };

  if (!user) {
    return res.status(401).json(genericError);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json(genericError);
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
    req.session.userId = user.id;
    res.json({ message: 'Logged in successfully', user: toSafeUser(user) });
  });
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
    res.clearCookie('apptracker.sid');
    res.json({ message: 'Logged out successfully' });
  });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(401).json({ error: 'You must be logged in to do that.' });
  }
  res.json({ user: toSafeUser(user) });
}

module.exports = { register, login, logout, me };
