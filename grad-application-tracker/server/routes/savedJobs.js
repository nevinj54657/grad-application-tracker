const express = require('express');

const savedJobController = require('../controllers/savedJobController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(savedJobController.list));
router.post('/', asyncHandler(savedJobController.create));
router.get('/:id', asyncHandler(savedJobController.getOne));
router.patch('/:id', asyncHandler(savedJobController.update));
router.delete('/:id', asyncHandler(savedJobController.remove));
router.post('/:id/apply', asyncHandler(savedJobController.convertToApplication));

module.exports = router;
