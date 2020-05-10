/**
* Use this to bootstrap API outside of serverless environment
* Examples:
* node api
* nodemon api.js
*/

const { api } = require('./index');

const port = process.env.PORT || 3000;
api.listen(port, () => console.log(`Server is listening on port ${port}.`));
