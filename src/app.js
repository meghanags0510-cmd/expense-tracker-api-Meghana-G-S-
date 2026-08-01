const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./docs/openapi');
const expensesRouter = require('./routes/expenses.routes');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.get('/api-docs.json', (req, res) => res.status(200).json(openapiSpec));

  app.use('/expenses', expensesRouter);

  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} was not found.` });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

module.exports = createApp;
