const express = require('express');

const tagController = require('../controllers/tagController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(tagController.list));
router.post('/', asyncHandler(tagController.create));
router.delete('/:id', asyncHandler(tagController.remove));

module.exports = router;
