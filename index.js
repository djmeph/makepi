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
const { jwt } = require('./services');

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
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// parse all requests as JSON
app.use(bodyParser.json({ type: 'application/json' }));

// Authenticate token and reject unauthorized access
app.use('/', jwt);

// Initialize routes
app.use('/', router());

// 404 Not Found fallback
app.use((req, res) => {
    res.status(404).json({ message: 'NOT FOUND' });
});

app.use((err, req, res) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Invalid Token' });
    } else if (err.type === 'entity.parse.failed') {
        res.status(400).json({ message: 'Malformed body parameters' });
    } else {
        res.status(500).json({ message: 'Unkown Error' });
    }
});

module.exports = {
    // Wrap Express app in serverless adapter and export to Lambda handler
    handler: serverless(app),
    app
};
