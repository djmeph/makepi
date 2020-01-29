const { env } = require('./nodemon.json');

process.env = { ...process.env, ...env };
const { 2: file, 3: fn } = process.argv;
// eslint-disable-next-line import/no-dynamic-require
const dep = require(`./${file}`);
dep[fn]()
    .then(() => process.exit())
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
