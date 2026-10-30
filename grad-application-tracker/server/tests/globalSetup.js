// Runs once before the whole test suite. Pushes the current Prisma schema
// to the test database so migrations don't need to be run by hand first.
require('./setupEnv');
const { execSync } = require('child_process');

module.exports = async function globalSetup() {
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    cwd: require('path').join(__dirname, '..'),
    env: process.env,
  });
};
