const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

let cachedClient = null;

function getClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

function getBucketName() {
  return process.env.SUPABASE_BUCKET || 'bug-attachments';
}

function sanitizeFilename(name) {
  return name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .slice(0, 100);
}

async function uploadFile({ bugId, buffer, mimeType, originalName }) {
  const supabase = getClient();
  const bucket = getBucketName();
  const safeName = sanitizeFilename(originalName);
  const storageKey = `${bugId}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storageKey, buffer, { contentType: mimeType, upsert: false });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storageKey);

  return {
    url: publicUrlData.publicUrl,
    storageKey,
    filename: safeName,
    mimeType,
    size: buffer.length,
  };
}

async function deleteFiles(storageKeys) {
  if (!storageKeys || storageKeys.length === 0) return;
  const supabase = getClient();
  const bucket = getBucketName();
  const { error } = await supabase.storage.from(bucket).remove(storageKeys);
  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
}

module.exports = { uploadFile, deleteFiles };
