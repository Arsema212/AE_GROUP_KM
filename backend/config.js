const dotenv = require('dotenv');
const os = require('os');

dotenv.config();

function buildDefaultDbUrl() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME || 'ae_trade_kms';
  const username = process.env.DB_USER || process.env.USER || os.userInfo().username;
  const password = process.env.DB_PASSWORD || '';

  if (password) {
    return `postgres://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }
  return `postgres://${encodeURIComponent(username)}@${host}:${port}/${database}`;
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'kms_prototype_secret',
  port: process.env.PORT || 4000,
  db: {
    connectionString: process.env.DATABASE_URL || buildDefaultDbUrl(),
  },
};
