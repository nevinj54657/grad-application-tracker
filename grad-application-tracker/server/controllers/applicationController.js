const prisma = require('../services/prisma');
const AppError = require('../utils/AppError');
const { validateJobFields, EMPLOYMENT_TYPES } = require('../utils/jobFields');
const { isPositiveIntId, isOptionalDate, isValidEnum } = require('../utils/validators');

const STATUSES = ['SAVED', 'APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];
const SORT_FIELDS = { deadline: 'deadline', createdAt: 'createdAt', dateApplied: 'dateApplied' };

const APPLICATION_INCLUDE = {
  tags: { include: { tag: true } },
};

function serialize(application) {
  return { ...application, tags: application.tags.map((t) => t.tag) };
}

async function getOwnedApplication(userId, id, include = {}) {
  const application = await prisma.application.findUnique({ where: { id }, include });
  if (!application || application.userId !== userId) {
    throw new AppError(404, 'Application not found.');
  }
  return application;
}

// Verifies every tag id belongs to the requesting user; returns the validated list.
async function resolveTagIds(userId, tagIds) {
  if (tagIds === undefined) return undefined;
  if (!Array.isArray(tagIds) || !tagIds.every((id) => isPositiveIntId(id))) {
    throw new AppError(400, 'tagIds must be an array of valid tag ids.');
  }
  const ids = tagIds.map(Number);
  if (ids.length === 0) return [];

  const ownedCount = await prisma.tag.count({ where: { id: { in: ids }, userId } });
  if (ownedCount !== ids.length) {
    throw new AppError(400, 'One or more tags are invalid.');
  }
  return ids;
}

async function list(req, res) {
  const { search, status, employmentType, tagId, sort, order } = req.query;

  const where = { userId: req.userId };

  if (search) {
    where.OR = [
      { company: { contains: search } },
      { jobTitle: { contains: search } },
      { location: { contains: search } },
    ];
  }
  if (status && STATUSES.includes(status)) {
    where.status = status;
  }
  if (employmentType && EMPLOYMENT_TYPES.includes(employmentType)) {
    where.employmentType = employmentType;
  }
  if (tagId && isPositiveIntId(tagId)) {
    where.tags = { some: { tagId: Number(tagId) } };
  }

  const orderBy = { [SORT_FIELDS[sort] || 'createdAt']: order === 'asc' ? 'asc' : 'desc' };

  const applications = await prisma.application.findMany({ where, orderBy, include: APPLICATION_INCLUDE });
  res.json({ applications: applications.map(serialize) });
}

async function getOne(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid application id.');

  const application = await getOwnedApplication(req.userId, id, {
    ...APPLICATION_INCLUDE,
    history: { orderBy: { changedAt: 'asc' } },
    interviews: { orderBy: { scheduledAt: 'asc' } },
  });

  res.json({ application: serialize(application) });
}

async function create(req, res) {
  const { errors, data } = validateJobFields(req.body);

  const status = req.body.status || 'SAVED';
  if (!STATUSES.includes(status)) {
    errors.status = 'Please select a valid status.';
  }
  if (!isOptionalDate(req.body.dateApplied)) {
    errors.dateApplied = 'Please enter a valid date applied.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }

  const tagIds = await resolveTagIds(req.userId, req.body.tagIds);
  const dateApplied = req.body.dateApplied ? new Date(req.body.dateApplied) : null;

  const application = await prisma.$transaction(async (tx) => {
    const created = await tx.application.create({
      data: {
        ...data,
        status,
        dateApplied,
        userId: req.userId,
        ...(tagIds && { tags: { create: tagIds.map((tagId) => ({ tagId })) } }),
      },
      include: APPLICATION_INCLUDE,
    });

    await tx.applicationHistory.create({ data: { applicationId: created.id, status } });

    return created;
  });

  res.status(201).json({ message: 'Application created successfully', application: serialize(application) });
}

async function update(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid application id.');

  await getOwnedApplication(req.userId, id);

  const { errors, data } = validateJobFields(req.body, { partial: true });

  if (req.body.dateApplied !== undefined && !isOptionalDate(req.body.dateApplied)) {
    errors.dateApplied = 'Please enter a valid date applied.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
  }

  const tagIds = await resolveTagIds(req.userId, req.body.tagIds);
  if (req.body.dateApplied !== undefined) {
    data.dateApplied = req.body.dateApplied ? new Date(req.body.dateApplied) : null;
  }

  const application = await prisma.$transaction(async (tx) => {
    if (tagIds !== undefined) {
      await tx.applicationTag.deleteMany({ where: { applicationId: id } });
    }
    return tx.application.update({
      where: { id },
      data: {
        ...data,
        ...(tagIds !== undefined && { tags: { create: tagIds.map((tagId) => ({ tagId })) } }),
      },
      include: APPLICATION_INCLUDE,
    });
  });

  res.json({ message: 'Application updated successfully', application: serialize(application) });
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid application id.');

  await getOwnedApplication(req.userId, id);
  await prisma.application.delete({ where: { id } });
  res.json({ message: 'Application deleted successfully' });
}

async function updateStatus(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid application id.');

  const { status } = req.body;
  if (!isValidEnum(status, STATUSES) || !status) {
    return res.status(400).json({ error: 'Please select a valid status.' });
  }

  const existing = await getOwnedApplication(req.userId, id);

  const data = { status };
  if (status === 'APPLIED' && !existing.dateApplied) {
    data.dateApplied = new Date();
  }

  const application = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({ where: { id }, data, include: APPLICATION_INCLUDE });
    await tx.applicationHistory.create({ data: { applicationId: id, status } });
    return updated;
  });

  res.json({ message: 'Application status updated', application: serialize(application) });
}

async function getHistory(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid application id.');

  await getOwnedApplication(req.userId, id);

  const history = await prisma.applicationHistory.findMany({
    where: { applicationId: id },
    orderBy: { changedAt: 'asc' },
  });

  res.json({ history });
}

module.exports = { list, getOne, create, update, remove, updateStatus, getHistory };
