const app = require('./app');
const { port } = require('./config');

const initialPort = Number(port) || 4000;
const maxRetries = 5;

function startServer(targetPort, attempt = 0) {
  const server = app.listen(targetPort, () => {
    console.log(`AE Trade Group KMS backend running on http://localhost:${targetPort}`);
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
