contract("ReserveManagerUnitTest", function(accounts) {
    let reserveManager;

    const MIN_THRESHOLD = 2000;
    const MID_THRESHOLD = 3000;
    const MAX_THRESHOLD = 4000;

    const owner          = accounts[0];
    const nonOwner       = accounts[1];
    const depositWallet  = accounts[2];
    const withdrawWallet = accounts[3];

    const nullAddress = require("../utilities.js").address(0);
    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
       contractAddressLocatorProxy    = await artifacts.require("ContractAddressLocatorProxyMockup").new();
       ethConverter                   = await artifacts.require("ETHConverterMockup"       ).new();
       paymentManager                 = await artifacts.require("PaymentManagerMockup"                ).new();
       reserveManager = await artifacts.require("ReserveManager").new(contractAddressLocatorProxy.address);

       await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
       await contractAddressLocatorProxy.set("IPaymentManager", paymentManager         .address);
    });

    describe("security assertion:", function() {
        it("function setWallets should abort with an error if called by a non-owner", async function() {
            await catchRevert(reserveManager.setWallets(1, depositWallet, withdrawWallet, {from: nonOwner}));
        });
        it("function setThresholds should abort with an error if called by a non-owner", async function() {
            await catchRevert(reserveManager.setThresholds(1, MIN_THRESHOLD, MAX_THRESHOLD, MID_THRESHOLD, {from: nonOwner}));
        });
        it("function setWallets should abort with an error if the deposit-wallet is invalid", async function() {
            await catchRevert(reserveManager.setWallets(1, nullAddress, withdrawWallet, {from: owner}));
        });
        it("function setWallets should abort with an error if the withdraw-wallet is invalid", async function() {
            await catchRevert(reserveManager.setWallets(1, depositWallet, nullAddress, {from: owner}));
        });
        it("function setThresholds should abort with an error if min-threshold > mid-threshold", async function() {
            await catchRevert(reserveManager.setThresholds(1, MIN_THRESHOLD, MAX_THRESHOLD, MIN_THRESHOLD - 1, {from: owner}));
        });
        it("function setThresholds should abort with an error if max-threshold < mid-threshold", async function() {
            await catchRevert(reserveManager.setThresholds(1, MIN_THRESHOLD, MAX_THRESHOLD, MAX_THRESHOLD + 1, {from: owner}));
        });
    });

    describe("functionality assertion:", function() {
        before(async function() {
            await reserveManager.setWallets(1, depositWallet, withdrawWallet);
            await reserveManager.setThresholds(1, MIN_THRESHOLD, MAX_THRESHOLD, MID_THRESHOLD);
        });
        it("function getDepositParams should return zero amount if the balance is too high", async function() {
            const [wallet, amount] = await reserveManager.getDepositParams(MIN_THRESHOLD + 1);
            assert(amount.equals(0), `amount = ${amount}`);
        });
        it("function getWithdrawParams should return zero amount if the balance is too low", async function() {
            const [wallet, amount] = await reserveManager.getWithdrawParams(MAX_THRESHOLD - 1);
            assert(amount.equals(0), `amount = ${amount}`);
        });
        it("function getWithdrawParams should return zero amount if payments exists", async function() {
            let balance = MAX_THRESHOLD + 900;
            await paymentManager.setNumOfPayments(1);
            let [wallet, amount] = await reserveManager.getWithdrawParams(balance);
            assert(amount.equals(0), `amount = ${amount}`);

            await paymentManager.setNumOfPayments(2);
            [wallet, amount] = await reserveManager.getWithdrawParams(balance);
            assert(amount.equals(0), `amount = ${amount}`);

            await paymentManager.setNumOfPayments(0);
            [wallet, amount] = await reserveManager.getWithdrawParams(balance);
            assert(amount > 0, `amount = ${amount}`);
        });
        for (let i = 0; i < 10; i++) {
            it(`function getDepositParams / test ${i}`, async function() {
                const balance = MIN_THRESHOLD - i;
                const amount  = MID_THRESHOLD - balance;
                const paymentsSum = i*1000;
                await paymentManager.setPaymentsSum(paymentsSum);
                const [_depositWallet, _amount] = await reserveManager.getDepositParams(balance);
                const expected = `wallet: ${ depositWallet}, amount: ${ amount + paymentsSum}`;
                const actual   = `wallet: ${_depositWallet}, amount: ${ _amount}`;
                assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
            });
        }
        for (let i = 0; i < 10; i++) {
            it(`function getWithdrawParams / test ${i}`, async function() {
                const balance = MAX_THRESHOLD + i;
                const amount  = balance - MID_THRESHOLD;
                const [_withdrawWallet, _amount] = await reserveManager.getWithdrawParams(balance);
                const expected = `wallet: ${ withdrawWallet}, amount: ${ amount}`;
                const actual   = `wallet: ${_withdrawWallet}, amount: ${_amount}`;
                assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
            });
        }
    });

    describe("function setWallets:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy    = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            ethConverter                   = await artifacts.require("ETHConverterMockup"       ).new();
            paymentManager                 = await artifacts.require("PaymentManagerMockup"                ).new();
            reserveManager = await artifacts.require("ReserveManager").new(contractAddressLocatorProxy.address);

            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
            await contractAddressLocatorProxy.set("IPaymentManager", paymentManager         .address);
        });
        it("should save and publish ReserveWalletsSaved if all input values are within range", async function() {
            const response = await reserveManager.setWallets(1, depositWallet, withdrawWallet);
            const [actualDeposit, actualWithdraw] = await reserveManager.wallets();

            assert.equal(await reserveManager.walletsSequenceNum(), 1);
            assert.equal(actualDeposit, depositWallet);
            assert.equal(actualWithdraw, withdrawWallet);

            assert.equal(response.logs[0].event, "ReserveWalletsSaved");
            assert.equal(response.logs[0].args._deposit , depositWallet);
            assert.equal(response.logs[0].args._withdraw , withdrawWallet);
        });
        it("should not save and publish ReserveWalletsNotSaved if sequence num is not valid", async function() {
            await reserveManager.setWallets(1, depositWallet, withdrawWallet);
            const response = await reserveManager.setWallets(1, accounts[5], accounts[6]);
            const [actualDeposit, actualWithdraw] = await reserveManager.wallets();

            assert.equal(await reserveManager.walletsSequenceNum(), 1);
            assert.equal(actualDeposit, depositWallet);
            assert.equal(actualWithdraw, withdrawWallet);

            assert.equal(response.logs[0].event, "ReserveWalletsNotSaved");
            assert.equal(response.logs[0].args._deposit , accounts[5]);
            assert.equal(response.logs[0].args._withdraw , accounts[6]);
        });
    });

    describe("function setThresholds:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy    = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            ethConverter                   = await artifacts.require("ETHConverterMockup"       ).new();
            paymentManager                 = await artifacts.require("PaymentManagerMockup"                ).new();
            reserveManager = await artifacts.require("ReserveManager").new(contractAddressLocatorProxy.address);

            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
            await contractAddressLocatorProxy.set("IPaymentManager", paymentManager         .address);
        });
        it("should save and publish ReserveThresholdsSaved if all input values are within range", async function() {
            const response = await reserveManager.setThresholds(1, MIN_THRESHOLD, MAX_THRESHOLD, MID_THRESHOLD);
            const [actualMin, actualMax, actualMid] = await reserveManager.thresholds();

            assert.equal(await reserveManager.thresholdsSequenceNum(), 1);
            assert.equal(actualMin, MIN_THRESHOLD);
            assert.equal(actualMax, MAX_THRESHOLD);
            assert.equal(actualMid, MID_THRESHOLD);

            assert.equal(response.logs[0].event, "ReserveThresholdsSaved");
            assert.equal(response.logs[0].args._min , MIN_THRESHOLD);
            assert.equal(response.logs[0].args._max , MAX_THRESHOLD);
            assert.equal(response.logs[0].args._mid , MID_THRESHOLD);
        });
        it("should not save and publish ReserveThresholdsNotSaved if sequence num is not valid", async function() {
            await reserveManager.setThresholds(1, 22, 100, 50);
            const response = await reserveManager.setThresholds(1, MIN_THRESHOLD, MAX_THRESHOLD, MID_THRESHOLD);
            const [actualMin, actualMax, actualMid] = await reserveManager.thresholds();

            assert.equal(await reserveManager.thresholdsSequenceNum(), 1);
            assert.equal(actualMin, 22);
            assert.equal(actualMax, 100);
            assert.equal(actualMid, 50);

            assert.equal(response.logs[0].event, "ReserveThresholdsNotSaved");
            assert.equal(response.logs[0].args._min , MIN_THRESHOLD);
            assert.equal(response.logs[0].args._max , MAX_THRESHOLD);
            assert.equal(response.logs[0].args._mid , MID_THRESHOLD);
        });
    });
});
