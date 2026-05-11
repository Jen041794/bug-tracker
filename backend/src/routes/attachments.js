const express = require('express');
const multer = require('multer');
const prisma = require('../lib/prisma');
const storage = require('../lib/storage');

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('UNSUPPORTED_FILE_TYPE'));
    }
  },
});

const bugScoped = express.Router({ mergeParams: true });

bugScoped.post('/', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File exceeds 5MB limit' });
      }
      if (err.message === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({
          error: `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
        });
      }
      console.error('Upload middleware failed:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'file field is required' });
    }

    const { bugId } = req.params;

    try {
      const bug = await prisma.bug.findUnique({ where: { id: bugId } });
      if (!bug) {
        return res.status(404).json({ error: 'Bug not found' });
      }

      const uploaded = await storage.uploadFile({
        bugId,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
      });

      const attachment = await prisma.attachment.create({
        data: {
          bugId,
          url: uploaded.url,
          storageKey: uploaded.storageKey,
          filename: uploaded.filename,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        },
      });

      res.status(201).json(attachment);
    } catch (uploadErr) {
      console.error(`POST /api/bugs/${bugId}/attachments failed:`, uploadErr);
      res.status(500).json({ error: 'Failed to upload attachment' });
    }
  });
});

const standalone = express.Router();

standalone.delete('/:id', async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    await storage.deleteFiles([attachment.storageKey]);
    await prisma.attachment.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error(`DELETE /api/attachments/${req.params.id} failed:`, err);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

module.exports = { bugScoped, standalone };
