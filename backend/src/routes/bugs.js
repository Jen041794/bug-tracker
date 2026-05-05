const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

const VALID_SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR'];
const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

router.get('/', async (req, res) => {
  try {
    const bugs = await prisma.bug.findMany({
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

module.exports = router;
