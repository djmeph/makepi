/**
 * Use this to bootstrap API outside of serverless environment
 * Examples:
 * node app
 * nodemon app.js
 */

const { app } = require('./index');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}.`));
