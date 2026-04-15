const { Pool } = require('pg');
const { db } = require('./config');

const pool = new Pool({ connectionString: db.connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
