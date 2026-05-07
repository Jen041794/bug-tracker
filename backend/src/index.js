const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', process.env.NODE_ENV === 'test' ? '.env.test' : '.env'),
});

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Bugs API:     http://localhost:${PORT}/api/bugs`);
});
