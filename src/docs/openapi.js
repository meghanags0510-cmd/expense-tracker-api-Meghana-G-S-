const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Smart Expense Tracker API',
      version: '1.0.0',
      description: 'A small REST API for tracking personal expenses.',
    },
    servers: [{ url: '/' }],
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')],
};

module.exports = swaggerJsdoc(options);
