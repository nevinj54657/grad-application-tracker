const prisma = require('../services/prisma');
const AppError = require('../utils/AppError');
const { validateJobFields, EMPLOYMENT_TYPES } = require('../utils/jobFields');
const { isPositiveIntId } = require('../utils/validators');

const SORT_FIELDS = { deadline: 'deadline', createdAt: 'createdAt' };

async function getOwnedSavedJob(userId, id) {
  const savedJob = await prisma.savedJob.findUnique({ where: { id } });
  if (!savedJob || savedJob.userId !== userId) {
    throw new AppError(404, 'Saved job not found.');
  }
  return savedJob;
}

async function list(req, res) {
  const { search, employmentType, sort, order } = req.query;

  const where = { userId: req.userId };

  if (search) {
    where.OR = [
      { company: { contains: search } },
      { jobTitle: { contains: search } },
      { location: { contains: search } },
    ];
  }

  if (employmentType && EMPLOYMENT_TYPES.includes(employmentType)) {
    where.employmentType = employmentType;
  }

  const orderBy = {
    [SORT_FIELDS[sort] || 'createdAt']: order === 'asc' ? 'asc' : 'desc',
  };

  const savedJobs = await prisma.savedJob.findMany({ where, orderBy });
  res.json({ savedJobs });
}

async function getOne(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid saved job id.');

  const savedJob = await getOwnedSavedJob(req.userId, id);
  res.json({ savedJob });
}

async function create(req, res) {
  const { errors, data } = validateJobFields(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }

  const savedJob = await prisma.savedJob.create({ data: { ...data, userId: req.userId } });
  res.status(201).json({ message: 'Saved job added successfully', savedJob });
}

async function update(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid saved job id.');

  await getOwnedSavedJob(req.userId, id);

  const { errors, data } = validateJobFields(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }

  const savedJob = await prisma.savedJob.update({ where: { id }, data });
  res.json({ message: 'Saved job updated successfully', savedJob });
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid saved job id.');

  await getOwnedSavedJob(req.userId, id);
  await prisma.savedJob.delete({ where: { id } });
  res.json({ message: 'Saved job deleted successfully' });
}

async function convertToApplication(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid saved job id.');

  const savedJob = await getOwnedSavedJob(req.userId, id);

  const application = await prisma.$transaction(async (tx) => {
    const created = await tx.application.create({
      data: {
        userId: req.userId,
        company: savedJob.company,
        jobTitle: savedJob.jobTitle,
        location: savedJob.location,
        employmentType: savedJob.employmentType,
        salary: savedJob.salary,
        jobUrl: savedJob.jobUrl,
        deadline: savedJob.deadline,
        notes: savedJob.notes,
        status: 'APPLIED',
        dateApplied: new Date(),
      },
    });

    await tx.applicationHistory.create({
      data: { applicationId: created.id, status: 'APPLIED' },
    });

    await tx.savedJob.delete({ where: { id } });

    return created;
  });

  res.status(201).json({ message: 'Saved job converted to an application', application });
}

module.exports = { list, getOne, create, update, remove, convertToApplication };
