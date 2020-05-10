// const models = require('../models');

module.exports = async (req, res) => {
    console.log(req.body);
    res.status(200).send('OK');
};
