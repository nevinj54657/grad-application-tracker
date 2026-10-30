const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

router.post('/register', asyncHandler(authController.register));
router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/logout', authController.logout);
router.get('/me', requireAuth, asyncHandler(authController.me));

module.exports = router;
