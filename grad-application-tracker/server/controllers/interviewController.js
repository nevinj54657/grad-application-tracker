const prisma = require('../services/prisma');
const AppError = require('../utils/AppError');
const { validateInterviewFields } = require('../utils/interviewFields');
const { isPositiveIntId } = require('../utils/validators');

async function getOwnedApplication(userId, applicationId) {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.userId !== userId) {
    throw new AppError(404, 'Application not found.');
  }
  return application;
}

async function getOwnedInterview(userId, interviewId) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { application: true },
  });
  if (!interview || interview.application.userId !== userId) {
    throw new AppError(404, 'Interview not found.');
  }
  return interview;
}

async function listAll(req, res) {
  const interviews = await prisma.interview.findMany({
    where: { application: { userId: req.userId } },
    include: { application: { select: { id: true, company: true, jobTitle: true } } },
    orderBy: { scheduledAt: 'asc' },
  });
  res.json({ interviews });
}

async function listForApplication(req, res) {
  const applicationId = Number(req.params.applicationId);
  if (!isPositiveIntId(applicationId)) throw new AppError(400, 'Invalid application id.');

  await getOwnedApplication(req.userId, applicationId);

  const interviews = await prisma.interview.findMany({
    where: { applicationId },
    orderBy: { scheduledAt: 'asc' },
  });
  res.json({ interviews });
}

async function createForApplication(req, res) {
  const applicationId = Number(req.params.applicationId);
  if (!isPositiveIntId(applicationId)) throw new AppError(400, 'Invalid application id.');

  await getOwnedApplication(req.userId, applicationId);

  const { errors, data } = validateInterviewFields(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }

  const interview = await prisma.interview.create({ data: { ...data, applicationId } });
  res.status(201).json({ message: 'Interview added successfully', interview });
}

async function update(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid interview id.');

  await getOwnedInterview(req.userId, id);

  const { errors, data } = validateInterviewFields(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }

  const interview = await prisma.interview.update({ where: { id }, data });
  res.json({ message: 'Interview updated successfully', interview });
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid interview id.');

  await getOwnedInterview(req.userId, id);
  await prisma.interview.delete({ where: { id } });
  res.json({ message: 'Interview deleted successfully' });
}

module.exports = { listAll, listForApplication, createForApplication, update, remove };
