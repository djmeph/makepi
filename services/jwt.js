const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config');

module.exports = (req, res, next) => {
    if (req.method.toUpperCase() === 'OPTIONS') return next();
    if (config.exceptions.indexOf(req.originalUrl) >= 0) return next();
    const auth = _.get(req, 'headers.authorization');
    if (!auth) return res.status(403).json({ message: 'Authorization Header Missing' });
    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') return res.status(403).json({ message: 'Invalid header' });
    if (!token) return res.status(403).json({ message: 'Token not found' });
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = { ...decoded };
        next();
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};
