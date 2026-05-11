// End-to-end smoke test: create bug → upload PNG → fetch detail → delete attachment → delete bug.
// Run with: node scripts/smoke-test-attachments.js
// Requires: backend dev server running on http://localhost:3000

const fs = require('fs');
const path = require('path');

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

// Smallest valid PNG (1x1 transparent pixel) so we don't need a real file on disk.
const TINY_PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63FCFFFFFF3F0005FE02FE9D58A2C50000000049454E44AE426082',
  'hex'
);

async function main() {
  console.log(`→ POST /api/bugs (create test bug)`);
  const createRes = await fetch(`${BASE}/api/bugs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'SMOKE TEST — attachment upload',
      severity: 'MINOR',
      reporter: 'smoke-bot',
    }),
  });
  if (!createRes.ok) throw new Error(`create bug failed: ${createRes.status} ${await createRes.text()}`);
  const bug = await createRes.json();
  console.log(`  ✅ bug.id = ${bug.id}`);

  console.log(`→ POST /api/bugs/${bug.id}/attachments (upload PNG)`);
  const form = new FormData();
  form.append('file', new Blob([TINY_PNG], { type: 'image/png' }), 'smoke-test.png');
  const uploadRes = await fetch(`${BASE}/api/bugs/${bug.id}/attachments`, {
    method: 'POST',
    body: form,
  });
  if (!uploadRes.ok) throw new Error(`upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  const attachment = await uploadRes.json();
  console.log(`  ✅ attachment.id = ${attachment.id}`);
  console.log(`  ✅ attachment.url = ${attachment.url}`);
  console.log(`  ✅ attachment.storageKey = ${attachment.storageKey}`);

  console.log(`→ GET ${attachment.url} (verify Supabase public URL works)`);
  const fetchRes = await fetch(attachment.url);
  if (!fetchRes.ok) throw new Error(`Supabase URL not reachable: ${fetchRes.status}`);
  const fetched = Buffer.from(await fetchRes.arrayBuffer());
  if (fetched.length !== TINY_PNG.length) {
    throw new Error(`size mismatch: expected ${TINY_PNG.length}, got ${fetched.length}`);
  }
  console.log(`  ✅ Supabase served file (${fetched.length} bytes)`);

  console.log(`→ GET /api/bugs/${bug.id} (verify attachment included)`);
  const detailRes = await fetch(`${BASE}/api/bugs/${bug.id}`);
  const detail = await detailRes.json();
  if (!detail.attachments || detail.attachments.length !== 1) {
    throw new Error(`expected 1 attachment, got ${JSON.stringify(detail.attachments)}`);
  }
  console.log(`  ✅ bug detail includes attachment`);

  console.log(`→ DELETE /api/attachments/${attachment.id}`);
  const delAttRes = await fetch(`${BASE}/api/attachments/${attachment.id}`, { method: 'DELETE' });
  if (delAttRes.status !== 204) throw new Error(`delete attachment failed: ${delAttRes.status}`);
  console.log(`  ✅ attachment deleted`);

  console.log(`→ GET ${attachment.url}?cb=... (verify file gone, bypass CDN cache)`);
  const cacheBust = `${attachment.url}?cb=${Date.now()}`;
  const verifyGone = await fetch(cacheBust);
  if (verifyGone.ok) throw new Error(`file still accessible after delete: ${verifyGone.status}`);
  console.log(`  ✅ Supabase returns ${verifyGone.status} (file gone)`);

  console.log(`→ DELETE /api/bugs/${bug.id}`);
  const delBugRes = await fetch(`${BASE}/api/bugs/${bug.id}`, { method: 'DELETE' });
  if (delBugRes.status !== 204) throw new Error(`delete bug failed: ${delBugRes.status}`);
  console.log(`  ✅ bug deleted`);

  console.log('\n🎉 ALL SMOKE CHECKS PASSED');
}

main().catch((err) => {
  console.error('\n❌ SMOKE TEST FAILED:', err.message);
  process.exit(1);
});
