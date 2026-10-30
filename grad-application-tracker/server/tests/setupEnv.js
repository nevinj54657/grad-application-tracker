// Loaded before each test file. Points the app at the test database
// instead of the developer's local .env, so tests never touch dev data.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.test'), override: true });
