const express = require('express');

const interviewController = require('../controllers/interviewController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(interviewController.listAll));
router.patch('/:id', asyncHandler(interviewController.update));
router.delete('/:id', asyncHandler(interviewController.remove));

module.exports = router;
