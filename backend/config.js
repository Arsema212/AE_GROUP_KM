const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'kms_prototype_secret',
  port: process.env.PORT || 4000,
  db: {
    sqlitePath: process.env.SQLITE_DB_PATH || './data/kms.sqlite',
  },
};
