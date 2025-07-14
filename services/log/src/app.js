const express = require('express');
const v1Routes = require('./routes/v1.routes');

const app = express();

app.use(express.json());
app.get('/health', (req, res) => {
  res.status(200).send({ service: 'log-service', status: 'UP' });
});
app.use('/', v1Routes);

module.exports = app;