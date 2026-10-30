const prisma = require('../services/prisma');

const CARD_STATUSES = ['SAVED', 'APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'];

async function getDashboard(req, res) {
  const userId = req.userId;
  const now = new Date();

  const [statusCounts, savedJobs, applicationsWithDeadline, upcomingInterviews] = await Promise.all([
    prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.savedJob.findMany({
      where: { userId, deadline: { gte: now } },
      orderBy: { deadline: 'asc' },
      take: 5,
      select: { id: true, company: true, jobTitle: true, deadline: true },
    }),
    prisma.application.findMany({
      where: { userId, deadline: { gte: now } },
      orderBy: { deadline: 'asc' },
      take: 5,
      select: { id: true, company: true, jobTitle: true, deadline: true },
    }),
    prisma.interview.findMany({
      where: { application: { userId }, scheduledAt: { gte: now } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: { application: { select: { id: true, company: true, jobTitle: true } } },
    }),
  ]);

  const counts = Object.fromEntries(CARD_STATUSES.map((status) => [status, 0]));
  statusCounts.forEach(({ status, _count }) => {
    if (status in counts) counts[status] = _count._all;
  });

  const upcomingDeadlines = [
    ...savedJobs.map((job) => ({ ...job, source: 'savedJob' })),
    ...applicationsWithDeadline.map((app) => ({ ...app, source: 'application' })),
  ]
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  res.json({ counts, upcomingDeadlines, upcomingInterviews });
}

module.exports = { getDashboard };
