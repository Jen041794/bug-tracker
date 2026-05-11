const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
const bugsRouter = require('./routes/bugs');
const attachmentsRouters = require('./routes/attachments');

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
  : null;

app.use(
  cors({
    origin: allowedOrigins ?? true,
  })
);
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message,
    });
  }
});

app.use('/api/bugs', bugsRouter);
app.use('/api/bugs/:bugId/attachments', attachmentsRouters.bugScoped);
app.use('/api/attachments', attachmentsRouters.standalone);

module.exports = app;
