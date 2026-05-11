const express = require('express');
const prisma = require('../lib/prisma');
const storage = require('../lib/storage');

const router = express.Router();

const VALID_SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR'];
const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

router.get('/', async (req, res) => {
  const { status, severity } = req.query;
  const errors = [];

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (severity !== undefined && !VALID_SEVERITIES.includes(severity)) {
    errors.push(`severity must be one of: ${VALID_SEVERITIES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const where = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;

  try {
    const bugs = await prisma.bug.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(bugs);
  } catch (err) {
    console.error('GET /api/bugs failed:', err);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bug = await prisma.bug.findUnique({
      where: { id: req.params.id },
      include: {
        attachments: { orderBy: { uploadedAt: 'asc' } },
      },
    });

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json(bug);
  } catch (err) {
    console.error(`GET /api/bugs/${req.params.id} failed:`, err);
    res.status(500).json({ error: 'Failed to fetch bug' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, severity, status, assignee, reporter } = req.body;

  const errors = [];
  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('title is required');
  } else if (title.length > 200) {
    errors.push('title must be 200 characters or fewer');
  }
  if (!severity || !VALID_SEVERITIES.includes(severity)) {
    errors.push(`severity is required and must be one of: ${VALID_SEVERITIES.join(', ')}`);
  }
  if (!reporter || typeof reporter !== 'string' || reporter.trim() === '') {
    errors.push('reporter is required');
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const bug = await prisma.bug.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        severity,
        status: status ?? 'OPEN',
        assignee: assignee ?? null,
        reporter: reporter.trim(),
      },
    });
    res.status(201).json(bug);
  } catch (err) {
    console.error('POST /api/bugs failed:', err);
    res.status(500).json({ error: 'Failed to create bug' });
  }
});

router.patch('/:id', async (req, res) => {
  const { title, description, severity, status, assignee, reporter } = req.body;
  const data = {};
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push('title cannot be empty');
    } else if (title.length > 200) {
      errors.push('title must be 200 characters or fewer');
    } else {
      data.title = title.trim();
    }
  }
  if (description !== undefined) {
    data.description = description;
  }
  if (severity !== undefined) {
    if (!VALID_SEVERITIES.includes(severity)) {
      errors.push(`severity must be one of: ${VALID_SEVERITIES.join(', ')}`);
    } else {
      data.severity = severity;
    }
  }
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    } else {
      data.status = status;
    }
  }
  if (assignee !== undefined) {
    data.assignee = assignee;
  }
  if (reporter !== undefined) {
    if (typeof reporter !== 'string' || reporter.trim() === '') {
      errors.push('reporter cannot be empty');
    } else {
      data.reporter = reporter.trim();
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ errors: ['no fields provided to update'] });
  }

  try {
    const bug = await prisma.bug.update({
      where: { id: req.params.id },
      data,
    });
    res.json(bug);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Bug not found' });
    }
    console.error(`PATCH /api/bugs/${req.params.id} failed:`, err);
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { bugId: req.params.id },
      select: { storageKey: true },
    });

    if (attachments.length > 0) {
      try {
        await storage.deleteFiles(attachments.map((a) => a.storageKey));
      } catch (storageErr) {
        console.error(`Storage cleanup failed for bug ${req.params.id}:`, storageErr);
      }
    }

    await prisma.bug.delete({
      where: { id: req.params.id },
    });
    res.status(204).end();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Bug not found' });
    }
    console.error(`DELETE /api/bugs/${req.params.id} failed:`, err);
    res.status(500).json({ error: 'Failed to delete bug' });
  }
});

module.exports = router;
