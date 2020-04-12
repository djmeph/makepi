const _ = require('lodash');
const PaymentProcessor = require('../services/payment-processor');

module.exports = async () => {
    const paymentProcessor = new PaymentProcessor();
    // Process each scheduled payent async
    const processed = await paymentProcessor.run();
    paymentProcessor.log.info({ processed: _.filter(processed, (n) => n).length });
};
