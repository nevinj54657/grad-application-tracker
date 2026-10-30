const request = require('supertest');
const { app, prisma, resetDb } = require('./testHelpers');

beforeEach(resetDb);
afterAll(async () => {
  await prisma.$disconnect();
});

const validUser = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

describe('POST /api/auth/register', () => {
  it('creates an account and never returns the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short', confirmPassword: 'short' });

    expect(res.status).toBe(400);
  });

  it('rejects mismatched passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, confirmPassword: 'somethingElse123' });

    expect(res.status).toBe(400);
  });

  it('rejects an invalid email address', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongPassword123' });

    expect(res.status).toBe(401);
  });

  it('uses the same generic error for a wrong password and an unknown email (no user enumeration)', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongPassword123' });

    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when not logged in', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user for a logged-in session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(validUser);

    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });
});

describe('POST /api/auth/logout', () => {
  it('ends the session so /me is unauthorised afterwards', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(validUser);

    await agent.post('/api/auth/logout');
    const res = await agent.get('/api/auth/me');

    expect(res.status).toBe(401);
  });
});
