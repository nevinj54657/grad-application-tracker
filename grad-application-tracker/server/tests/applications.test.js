const request = require('supertest');
const { app, prisma, resetDb } = require('./testHelpers');

beforeEach(resetDb);
afterAll(async () => {
  await prisma.$disconnect();
});

async function registerAgent(email) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
    confirmPassword: 'password123',
  });
  return agent;
}

const sampleApplication = {
  company: 'McLaren',
  jobTitle: 'Software Engineering Placement',
  location: 'Woking',
  employmentType: 'PLACEMENT',
  status: 'SAVED',
};

describe('POST /api/applications', () => {
  it('creates an application and records the initial status in history', async () => {
    const userA = await registerAgent('userA@example.com');

    const createRes = await userA.post('/api/applications').send(sampleApplication);
    expect(createRes.status).toBe(201);
    expect(createRes.body.application.status).toBe('SAVED');

    const historyRes = await userA.get(`/api/applications/${createRes.body.application.id}/history`);
    expect(historyRes.body.history).toHaveLength(1);
    expect(historyRes.body.history[0].status).toBe('SAVED');
  });

  it('rejects a request missing required fields', async () => {
    const userA = await registerAgent('userA@example.com');

    const res = await userA.post('/api/applications').send({ location: 'Remote' });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors.company).toBeDefined();
    expect(res.body.fieldErrors.jobTitle).toBeDefined();
  });

  it('rejects requests from a logged-out client', async () => {
    const res = await request(app).post('/api/applications').send(sampleApplication);
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/applications/:id/status', () => {
  it('updates the status and appends a new history entry', async () => {
    const userA = await registerAgent('userA@example.com');
    const created = await userA.post('/api/applications').send(sampleApplication);
    const id = created.body.application.id;

    const res = await userA.patch(`/api/applications/${id}/status`).send({ status: 'APPLIED' });
    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('APPLIED');
    expect(res.body.application.dateApplied).not.toBeNull();

    const historyRes = await userA.get(`/api/applications/${id}/history`);
    expect(historyRes.body.history).toHaveLength(2);
    expect(historyRes.body.history.map((h) => h.status)).toEqual(['SAVED', 'APPLIED']);
  });

  it('rejects an invalid status value', async () => {
    const userA = await registerAgent('userA@example.com');
    const created = await userA.post('/api/applications').send(sampleApplication);

    const res = await userA.patch(`/api/applications/${created.body.application.id}/status`).send({ status: 'NOT_A_REAL_STATUS' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/applications/:id', () => {
  it('deletes an application belonging to the current user', async () => {
    const userA = await registerAgent('userA@example.com');
    const created = await userA.post('/api/applications').send(sampleApplication);

    const deleteRes = await userA.delete(`/api/applications/${created.body.application.id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await userA.get(`/api/applications/${created.body.application.id}`);
    expect(getRes.status).toBe(404);
  });
});

describe('Ownership checks (User A cannot access User B applications)', () => {
  it('rejects User B reading User A application with 404', async () => {
    const userA = await registerAgent('userA@example.com');
    const userB = await registerAgent('userB@example.com');

    const created = await userA.post('/api/applications').send(sampleApplication);
    const id = created.body.application.id;

    const res = await userB.get(`/api/applications/${id}`);
    expect(res.status).toBe(404);
  });

  it('rejects User B updating User A application', async () => {
    const userA = await registerAgent('userA@example.com');
    const userB = await registerAgent('userB@example.com');

    const created = await userA.post('/api/applications').send(sampleApplication);
    const id = created.body.application.id;

    const res = await userB.patch(`/api/applications/${id}`).send({ company: 'Hijacked Co' });
    expect(res.status).toBe(404);

    const stillOwned = await userA.get(`/api/applications/${id}`);
    expect(stillOwned.body.application.company).toBe('McLaren');
  });

  it('rejects User B changing status of User A application', async () => {
    const userA = await registerAgent('userA@example.com');
    const userB = await registerAgent('userB@example.com');

    const created = await userA.post('/api/applications').send(sampleApplication);
    const id = created.body.application.id;

    const res = await userB.patch(`/api/applications/${id}/status`).send({ status: 'OFFER' });
    expect(res.status).toBe(404);
  });

  it('rejects User B deleting User A application, leaving it intact', async () => {
    const userA = await registerAgent('userA@example.com');
    const userB = await registerAgent('userB@example.com');

    const created = await userA.post('/api/applications').send(sampleApplication);
    const id = created.body.application.id;

    const deleteRes = await userB.delete(`/api/applications/${id}`);
    expect(deleteRes.status).toBe(404);

    const stillThere = await userA.get(`/api/applications/${id}`);
    expect(stillThere.status).toBe(200);
  });

  it("does not include User A's applications in User B's list", async () => {
    const userA = await registerAgent('userA@example.com');
    const userB = await registerAgent('userB@example.com');

    await userA.post('/api/applications').send(sampleApplication);

    const listRes = await userB.get('/api/applications');
    expect(listRes.body.applications).toHaveLength(0);
  });
});
