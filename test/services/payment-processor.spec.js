process.env.AWS_REGION = 'us-east-1';

const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const PaymentProcessor = require('../../services/payment-processor');
const models = require('../../models');
const fakeLogger = require('../util/fakeLogger');

const { expect, assert } = chai;
chai.use(chaiAsPromised);

const userId = '66351cc2-7fe6-466b-8ab8-424742721561';
const paymentMethodId = '3bcb77ef-6933-46e7-9962-4c8971d46fc9';
const paymentMethodKey = `stripe-payment-methods#${paymentMethodId}`;
const balance = 50;

const schedule = new models.schedules.Item({
    userId,
    balance,
});

const subscriptionCashMonthly = new models.subscriptions.Item({
    paymentDay: 1,
    paymentMethodKey: 'cash',
    plan: {
        planId: 'monthly-membership',
        versionNumber: 1
    },
    userId
});

const subscriptionCreditMonthly = new models.subscriptions.Item({
    paymentDay: 1,
    paymentMethodKey: '08601afd-627f-456c-8cfc-3b0038a45401',
    plan: {
        planId: 'monthly-membership',
        versionNumber: 1,
    },
    userId
});

const paymentMethodCredit = new models.stripePaymentMethods.Item({
    userId,
    source: {
        id: 'card_xxxxxxxxxxxxxxxxxxxxxxxx'
    }
});

const payment = new models.payments.Item({});

describe('UnitTests::', () => {
    describe('PaymentProcessor::', () => {
        let paymentProcessor;
        before(() => {
            sinon.stub(PaymentProcessor.prototype, 'charge').callsFake(async () => ({ amount: balance, metadata: {} }));
            sinon.stub(PaymentProcessor.prototype, 'putPaymentItem').callsFake(async () => payment);
            sinon.stub(PaymentProcessor.prototype, 'updateScheduledItem');
        });
        beforeEach(() => {
            paymentProcessor = new PaymentProcessor();
            paymentProcessor.log = fakeLogger;
        });
        it('Should return true if payment processing succeeds', async () => {
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getSubscription').callsFake(async () => subscriptionCreditMonthly);
            sinon.stub(paymentProcessor, 'getPaymentMethod').callsFake(async () => paymentMethodCredit);
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(true);
        });
        it('Should return false if payment processing fails', async () => {
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getSubscription').throws();
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('should return false if subscription not found', async () => {
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getSubscription').callsFake(async () => null);
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('Should pass and fail on a per schedule item basis', async () => {
            paymentProcessor.schedules = [schedule, null];
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            const getSubscriptionStub = sinon.stub(paymentProcessor, 'getSubscription');
            getSubscriptionStub.onCall(0).callsFake(async () => subscriptionCreditMonthly);
            getSubscriptionStub.onCall(1).throws();
            sinon.stub(paymentProcessor, 'getPaymentMethod').callsFake(async () => paymentMethodCredit);
            await paymentProcessor.processScheduledPayments();
            expect(paymentProcessor.processed[0]).to.equal(true);
            expect(paymentProcessor.processed[1]).to.equal(false);
        });
        it('getBalance method should return balance in schedule Item', async () => {
            const result = await paymentProcessor.getBalance(schedule);
            expect(result).to.equal(balance);
        });
        it('getBalance method should return 0 if balance not found', async () => {
            const scheduleNoBalance = new models.schedules.Item({
                userId
            });
            const result = await paymentProcessor.getBalance(scheduleNoBalance);
            expect(result).to.equal(0);
        });
        it('processPayment should return payment item if successful', async () => {
            sinon.stub(paymentProcessor, 'getPaymentMethod').callsFake(async () => paymentMethodCredit);
            const payment = await paymentProcessor.processPayment(userId, paymentMethodKey, balance);
            assert(payment.get('itemKey'));
            assert(payment.get('paymentId'));
        });
        it('_getSchema should return payment method schema only', async () => {
            const schema = paymentProcessor._getSchema(paymentMethodKey);
            expect(schema).to.equal('stripe-payment-methods');
        });
    });
});
