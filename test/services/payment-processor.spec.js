const sinon = require('sinon');
const { expect, assert } = require('chai');
const PaymentProcessor = require('../../services/payment-processor');

describe('UnitTests::', () => {
    describe('PaymentProcessor::', () => {
        let paymentProcessor;
        beforeEach(() => {
            paymentProcessor = new PaymentProcessor();
        });
        it('should return false on each schedule item that fails', (done) => {
            done();
        });
    });
});
