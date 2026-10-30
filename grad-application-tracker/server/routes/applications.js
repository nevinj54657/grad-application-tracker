const express = require('express');

const applicationController = require('../controllers/applicationController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const interviewRoutes = require('./interviews');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(applicationController.list));
router.post('/', asyncHandler(applicationController.create));
router.get('/:id', asyncHandler(applicationController.getOne));
router.patch('/:id', asyncHandler(applicationController.update));
router.delete('/:id', asyncHandler(applicationController.remove));
router.patch('/:id/status', asyncHandler(applicationController.updateStatus));
router.get('/:id/history', asyncHandler(applicationController.getHistory));

router.use('/:applicationId/interviews', interviewRoutes);

module.exports = router;
