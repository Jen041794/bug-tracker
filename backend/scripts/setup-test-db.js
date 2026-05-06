// 把 schema 同步到測試 DB（讀 .env.test 取連線字串）
// 用法：npm run test:setup
const path = require('path');
const { execSync } = require('child_process');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env.test'),
});

if (!process.env.DATABASE_URL) {
  console.error('❌ 找不到 DATABASE_URL，請確認 backend/.env.test 是否存在');
  process.exit(1);
}

console.log(`🔧 套用 migrations 到測試 DB...`);
execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  env: process.env,
});
console.log('✅ 測試 DB 準備好了');
