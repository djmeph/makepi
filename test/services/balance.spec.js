process.env.AWS_REGION = 'us-east-1';

const sinon = require('sinon');
const { expect, assert } = require('chai');
const Balance = require('../../services/balance');
const models = require('../../models');
const fakeLogger = require('../util/fakeLogger');
const mocks = require('../util/mocks');
const { userId, payment, schedule } = mocks;

describe('UnitTests::', () => {
    describe('Balance::', () => {
        let balance;
        before(() => {
            sinon.stub(models.payments.table, 'getAllByUserId').resolves([]);
            sinon.stub(models.schedules.table, 'getAllByUserId').resolves([]);
        });
        beforeEach(() => {
            balance = new Balance({
                log: fakeLogger,
                userId
            });
        });
        it('Should fetch payments and schedules', async () => {
            await balance.get();
            assert(balance.payments);
            assert(balance.schedules);
        });
        it('Should calculate payments sums by status', async () => {
            balance.payments = [
                new models.payments.Item({
                    ...payment,
                    amount: 10,
                    status: models.payments.config.statuses.pending
                }),
                new models.payments.Item({
                    ...payment,
                    amount: 20,
                    status: models.payments.config.statuses.complete
                }),
                new models.payments.Item({
                    ...payment,
                    amount: 30,
                    status: models.payments.config.statuses.failed
                })
            ];
            const sumPayments = balance.paymentsCounter();
            assert(sumPayments);
            expect(sumPayments.pending).to.equal(10);
            expect(sumPayments.complete).to.equal(20);
            expect(sumPayments.failed).to.equal(30);
        });
        it('Should calculate sum of multiple payments of the same status and unpopulated status should return undefined', async () => {
            balance.payments = [
                new models.payments.Item({
                    ...payment,
                    amount: 10,
                    status: models.payments.config.statuses.complete
                }),
                new models.payments.Item({
                    ...payment,
                    amount: 20,
                    status: models.payments.config.statuses.complete
                }),
                new models.payments.Item({
                    ...payment,
                    amount: 30,
                    status: models.payments.config.statuses.complete
                })
            ];
            const sumPayments = balance.paymentsCounter();
            expect(sumPayments.complete).to.equal(60);
            assert.isNotOk(sumPayments.pending);
            assert.isNotOk(sumPayments.failed);
        });
        it('Should calculate schedules sums by status', async () => {
            balance.schedules = [
                new models.schedules.Item({
                    ...schedule,
                    total: 10,
                    status: models.schedules.config.statuses.paid
                }),
                new models.schedules.Item({
                    ...schedule,
                    total: 20,
                    status: models.schedules.config.statuses.unpaid
                }),
                new models.schedules.Item({
                    ...schedule,
                    total: 30,
                    status: models.schedules.config.statuses.cancelled
                }),
                new models.schedules.Item({
                    ...schedule,
                    total: 40,
                    status: models.schedules.config.statuses.late
                })
            ];
            const sumSchedules = balance.schedulesCounter();
            assert(sumSchedules);
            expect(sumSchedules.paid).to.equal(10);
            expect(sumSchedules.unpaid).to.equal(20);
            expect(sumSchedules.cancelled).to.equal(30);
            expect(sumSchedules.late).to.equal(40);
        });
        it('Should calculate sum of multiple payments of the same status and unpopulated status should return undefined', async () => {
            balance.schedules = [
                new models.schedules.Item({
                    ...schedule,
                    total: 10,
                    status: models.schedules.config.statuses.paid
                }),
                new models.schedules.Item({
                    ...schedule,
                    total: 20,
                    status: models.schedules.config.statuses.paid
                }),
                new models.schedules.Item({
                    ...schedule,
                    total: 30,
                    status: models.schedules.config.statuses.paid
                }),
                new models.schedules.Item({
                    ...schedule,
                    total: 40,
                    status: models.schedules.config.statuses.paid
                })
            ];
            const sumSchedules = balance.schedulesCounter();
            expect(sumSchedules.paid).to.equal(100);
            assert.isNotOk(sumSchedules.unpaid);
            assert.isNotOk(sumSchedules.cancelled);
            assert.isNotOk(sumSchedules.late);
        });
        it('Should return sums of pending/complete payments, paid schedules, and account balance', async () => {
            balance.sumPayments.pending = 50;
            balance.sumPayments.complete = 75;
            balance.sumSchedules.paid = 100;
            const result = balance.pendingBalance();
            assert(result);
            expect(result.payments).to.equal(125);
            expect(result.schedules).to.equal(100);
            expect(result.balance).to.equal(25);
        });
        it('Should fetch payments and schedules, calculate totals and return balance', async () => {
            const result = await balance.getPending();
            assert(result);
            expect(result.payments).to.equal(0);
            expect(result.schedules).to.equal(0);
            expect(result.balance).to.equal(0);
        });
    });
});
