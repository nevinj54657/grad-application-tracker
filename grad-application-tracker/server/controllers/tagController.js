const prisma = require('../services/prisma');
const AppError = require('../utils/AppError');
const { isNonEmptyString, isPositiveIntId } = require('../utils/validators');

async function list(req, res) {
  const tags = await prisma.tag.findMany({
    where: { userId: req.userId },
    orderBy: { name: 'asc' },
  });
  res.json({ tags });
}

async function create(req, res) {
  const { name } = req.body;
  if (!isNonEmptyString(name, { maxLength: 50 })) {
    return res.status(400).json({ error: 'Tag name is required and must be 50 characters or fewer.' });
  }

  const existing = await prisma.tag.findUnique({
    where: { userId_name: { userId: req.userId, name: name.trim() } },
  });
  if (existing) {
    return res.status(409).json({ error: 'You already have a tag with that name.' });
  }

  const tag = await prisma.tag.create({ data: { name: name.trim(), userId: req.userId } });
  res.status(201).json({ message: 'Tag created successfully', tag });
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveIntId(id)) throw new AppError(400, 'Invalid tag id.');

  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag || tag.userId !== req.userId) {
    throw new AppError(404, 'Tag not found.');
  }

  await prisma.tag.delete({ where: { id } });
  res.json({ message: 'Tag deleted successfully' });
}

module.exports = { list, create, remove };
