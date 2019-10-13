/**
 * MakePI
 * An Open Source Makerspace CRM API
 *
 * Exports serverless handler for publishing Express
 * API to Lambda using API Gateway trigger
 * See `examples` directory for configuration examples
 */

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const router = require('./router');

// Build express app and export to serverless or vanilla nodeJS
const app = express();

// Set headers explicitly for browser compatibility
app.use((req, res, next) => {
  // Allow all origins in browsers
  res.header('Access-Control-Allow-Origin', '*');
  // Set allowed headers
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  // Set allowed methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});
// parse all requests as JSON
app.use(bodyParser.json({ type: 'application/json' }));
// Initialize routes
app.use('/', router());
// 404 Not Found fallback
app.use((req, res) => {
  res.status(404).json({ message: 'NOT FOUND' });
});

module.exports = {
  // Wrap Express app in serverless adapter and export to Lambda handler
  handler: serverless(app),
  app
};
