const express = require('express');

const dashboardController = require('../controllers/dashboardController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(dashboardController.getDashboard));

module.exports = router;
