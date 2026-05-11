jest.mock('../src/lib/storage', () => ({
  uploadFile: jest.fn(),
  deleteFiles: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');
const storage = require('../src/lib/storage');

const TINY_PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63FCFFFFFF3F0005FE02FE9D58A2C50000000049454E44AE426082',
  'hex'
);

const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000';

const seedBug = () =>
  prisma.bug.create({
    data: {
      title: 'Bug needing screenshot',
      severity: 'MAJOR',
      reporter: 'qa-michelle',
    },
  });

const fakeUploadResult = (bugId, filename = 'screenshot.png') => ({
  url: `https://supabase.example.com/${bugId}/abc-${filename}`,
  storageKey: `${bugId}/abc-${filename}`,
  filename,
  mimeType: 'image/png',
  size: TINY_PNG.length,
});

beforeEach(async () => {
  await prisma.bug.deleteMany();
  storage.uploadFile.mockReset();
  storage.deleteFiles.mockReset();
  storage.deleteFiles.mockResolvedValue(undefined);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/bugs/:bugId/attachments', () => {
  it('uploads an image and persists attachment metadata', async () => {
    const bug = await seedBug();
    storage.uploadFile.mockResolvedValueOnce(fakeUploadResult(bug.id));

    const res = await request(app)
      .post(`/api/bugs/${bug.id}/attachments`)
      .attach('file', TINY_PNG, { filename: 'screenshot.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      bugId: bug.id,
      filename: 'screenshot.png',
      mimeType: 'image/png',
      size: TINY_PNG.length,
    });
    expect(res.body.url).toMatch(/^https:\/\//);

    expect(storage.uploadFile).toHaveBeenCalledTimes(1);
    expect(storage.uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ bugId: bug.id, mimeType: 'image/png' })
    );

    const detail = await request(app).get(`/api/bugs/${bug.id}`);
    expect(detail.body.attachments).toHaveLength(1);
  });

  it('returns 404 when target bug does not exist', async () => {
    const res = await request(app)
      .post(`/api/bugs/${NON_EXISTENT_UUID}/attachments`)
      .attach('file', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });

    expect(res.status).toBe(404);
    expect(storage.uploadFile).not.toHaveBeenCalled();
  });

  it('rejects unsupported file types before uploading', async () => {
    const bug = await seedBug();

    const res = await request(app)
      .post(`/api/bugs/${bug.id}/attachments`)
      .attach('file', Buffer.from('not an image'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Unsupported/i);
    expect(storage.uploadFile).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/attachments/:id', () => {
  it('removes attachment from DB and asks storage to delete the file', async () => {
    const bug = await seedBug();
    storage.uploadFile.mockResolvedValueOnce(fakeUploadResult(bug.id));
    const created = await request(app)
      .post(`/api/bugs/${bug.id}/attachments`)
      .attach('file', TINY_PNG, { filename: 'screenshot.png', contentType: 'image/png' });

    const res = await request(app).delete(`/api/attachments/${created.body.id}`);

    expect(res.status).toBe(204);
    expect(storage.deleteFiles).toHaveBeenCalledWith([created.body.storageKey]);

    const detail = await request(app).get(`/api/bugs/${bug.id}`);
    expect(detail.body.attachments).toHaveLength(0);
  });
});

describe('DELETE /api/bugs/:id (cascade attachments)', () => {
  it('deletes attached files in storage before removing the bug', async () => {
    const bug = await seedBug();
    storage.uploadFile
      .mockResolvedValueOnce(fakeUploadResult(bug.id, 'one.png'))
      .mockResolvedValueOnce(fakeUploadResult(bug.id, 'two.png'));
    await request(app)
      .post(`/api/bugs/${bug.id}/attachments`)
      .attach('file', TINY_PNG, { filename: 'one.png', contentType: 'image/png' });
    await request(app)
      .post(`/api/bugs/${bug.id}/attachments`)
      .attach('file', TINY_PNG, { filename: 'two.png', contentType: 'image/png' });

    const res = await request(app).delete(`/api/bugs/${bug.id}`);

    expect(res.status).toBe(204);
    expect(storage.deleteFiles).toHaveBeenCalledTimes(1);
    const calledWith = storage.deleteFiles.mock.calls[0][0];
    expect(calledWith).toHaveLength(2);
  });
});
