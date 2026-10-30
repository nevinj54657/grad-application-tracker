const express = require('express');

const authRoutes = require('./auth');
const savedJobRoutes = require('./savedJobs');
const applicationRoutes = require('./applications');
const interviewsRootRoutes = require('./interviewsRoot');
const tagRoutes = require('./tags');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/saved-jobs', savedJobRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewsRootRoutes);
router.use('/tags', tagRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
