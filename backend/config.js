const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'kms_prototype_secret',
  port: process.env.PORT || 4000,
  db: {
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/ae_kms'
  }
};
