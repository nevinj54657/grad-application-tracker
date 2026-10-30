const app = require('../app');
const prisma = require('../services/prisma');

// All tables cascade from User, so this clears the whole test database.
async function resetDb() {
  await prisma.user.deleteMany();
}

module.exports = { app, prisma, resetDb };
