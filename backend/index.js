const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`AE Trade Group KMS backend running on http://localhost:${port}`);
});
