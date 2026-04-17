const app = require('./app');
const { port } = require('./config');
const db = require('./db');

const initialPort = Number(port) || 4000;
const maxRetries = 5;

function startServer(targetPort, attempt = 0) {
  const server = app.listen(targetPort, async () => {
    await db.getDb();
    console.log(`AE Trade Group KMS backend running on http://localhost:${targetPort}`);
    console.log(`SQLite database path: ${db.getResolvedPath()}`);
    if (process.env.VERCEL && !process.env.SQLITE_DB_PATH) {
      console.warn('Vercel detected without SQLITE_DB_PATH. Using /tmp/kms.sqlite (ephemeral storage).');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < maxRetries) {
      const nextPort = targetPort + 1;
      console.warn(`Port ${targetPort} is already in use. Retrying on ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error(`Unable to start backend server: ${err.message}`);
    process.exit(1);
  });
}

startServer(initialPort);
