const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

beforeEach(async () => {
  await prisma.bug.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

const sampleBug = () => ({
  title: 'Login button does nothing',
  description: '【問題現況】\n按下沒反應\n\n【預期情況】\n進入首頁',
  severity: 'MAJOR',
  reporter: 'qa-michelle',
});

describe('GET /health', () => {
  it('returns ok when DB is reachable', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });
});

describe('POST /api/bugs', () => {
  it('rejects payload missing required fields', async () => {
    const res = await request(app).post('/api/bugs').send({
      description: '只填了描述，標題、嚴重度、回報者都沒填',
    });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('title'),
        expect.stringContaining('severity'),
        expect.stringContaining('reporter'),
      ])
    );
  });

  it('creates a bug with status defaulted to OPEN', async () => {
    const res = await request(app).post('/api/bugs').send(sampleBug());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Login button does nothing',
      severity: 'MAJOR',
      status: 'OPEN',
      reporter: 'qa-michelle',
    });
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.createdAt).toEqual(expect.any(String));
  });
});

describe('GET /api/bugs', () => {
  it('returns all bugs and supports filtering by severity', async () => {
    await prisma.bug.createMany({
      data: [
        { title: 'Critical crash', severity: 'CRITICAL', reporter: 'a' },
        { title: 'Layout off by 1px', severity: 'MINOR', reporter: 'b' },
        { title: 'Slow query', severity: 'MAJOR', reporter: 'c' },
      ],
    });

    const all = await request(app).get('/api/bugs');
    expect(all.status).toBe(200);
    expect(all.body).toHaveLength(3);

    const filtered = await request(app)
      .get('/api/bugs')
      .query({ severity: 'CRITICAL' });
    expect(filtered.status).toBe(200);
    expect(filtered.body).toHaveLength(1);
    expect(filtered.body[0].title).toBe('Critical crash');
  });
});

describe('GET /api/bugs/:id', () => {
  it('returns 404 when the bug does not exist', async () => {
    const res = await request(app).get(
      '/api/bugs/00000000-0000-0000-0000-000000000000'
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe('PATCH /api/bugs/:id', () => {
  it('updates an existing bug', async () => {
    const created = await request(app).post('/api/bugs').send(sampleBug());

    const res = await request(app)
      .patch(`/api/bugs/${created.body.id}`)
      .send({ status: 'IN_PROGRESS', assignee: 'dev-小加' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
    expect(res.body.assignee).toBe('dev-小加');
    expect(res.body.title).toBe('Login button does nothing');
  });
});

describe('DELETE /api/bugs/:id', () => {
  it('removes the bug and subsequent GET returns 404', async () => {
    const created = await request(app).post('/api/bugs').send(sampleBug());

    const del = await request(app).delete(`/api/bugs/${created.body.id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/bugs/${created.body.id}`);
    expect(after.status).toBe(404);
  });
});
