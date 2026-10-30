const express = require('express');

const interviewController = require('../controllers/interviewController');
const asyncHandler = require('../middleware/asyncHandler');

// mergeParams so this router (mounted at /applications/:applicationId/interviews)
// can read req.params.applicationId. requireAuth is applied by the parent router.
const router = express.Router({ mergeParams: true });

router.get('/', asyncHandler(interviewController.listForApplication));
router.post('/', asyncHandler(interviewController.createForApplication));

module.exports = router;
