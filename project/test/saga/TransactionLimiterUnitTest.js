contract("TransactionLimiterUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let transactionLimiter;

    const MAX_DIFF = 1000000;
    const owner    = accounts[0];
    const nonOwner = accounts[1];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        transactionLimiter          = await artifacts.require("TransactionLimiter"               ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        it("function setMaxDiff should abort with an error if called by a non-owner", async function() {
            await catchRevert(transactionLimiter.setMaxDiff(1, 0, {from: nonOwner}));
        });
        it("function resetTotal should abort with an error if called by a non-user", async function() {
            await catchRevert(transactionLimiter.resetTotal({from: owner}));
        });
        it("function incTotalBuy should abort with an error if called by a non-user", async function() {
            await catchRevert(transactionLimiter.incTotalBuy(0, {from: owner}));
        });
        it("function incTotalSell should abort with an error if called by a non-user", async function() {
            await catchRevert(transactionLimiter.incTotalSell(0, {from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("IETHConverter", owner);
            await contractAddressLocatorProxy.set("ITransactionManager"  , owner);
        });
    });

    describe("functionality assertion:", function() {
        it("initial state", async function() {
            await assertEqual(transactionLimiter.maxDiff(), web3.toBigNumber(2).pow(256).minus(1));
        });
        it("function setMaxDiff", async function() {
            await transactionLimiter.setMaxDiff(1, MAX_DIFF);
            await assertEqual(transactionLimiter.maxDiff(), MAX_DIFF);
        });
        it("function resetTotal", async function() {
            await transactionLimiter.resetTotal();
            await assertEqual(transactionLimiter.totalBuy (), 0);
            await assertEqual(transactionLimiter.totalSell(), 0);
        });
        it("function incTotalBuy", async function() {
            await transactionLimiter.resetTotal();
            await transactionLimiter.incTotalBuy(MAX_DIFF);
            await catchRevert(transactionLimiter.incTotalBuy(1));
            await assertEqual(transactionLimiter.totalBuy(), MAX_DIFF);
        });
        it("function incTotalSell", async function() {
            await transactionLimiter.resetTotal();
            await transactionLimiter.incTotalSell(MAX_DIFF);
            await catchRevert(transactionLimiter.incTotalSell(1));
            await assertEqual(transactionLimiter.totalSell(), MAX_DIFF);
        });
        it("sequential flow", async function() {
            await transactionLimiter.resetTotal();
            await transactionLimiter.incTotalBuy (MAX_DIFF);
            await transactionLimiter.incTotalSell(MAX_DIFF);
            await transactionLimiter.incTotalSell(MAX_DIFF);
            await transactionLimiter.incTotalBuy (MAX_DIFF);
            await assertEqual(transactionLimiter.totalBuy (), MAX_DIFF * 2);
            await assertEqual(transactionLimiter.totalSell(), MAX_DIFF * 2);
        });
    });

     describe("function setMaxDiff:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            transactionLimiter          = await artifacts.require("TransactionLimiter"               ).new(contractAddressLocatorProxy.address);
            await contractAddressLocatorProxy.set("IETHConverter", owner);
            await contractAddressLocatorProxy.set("ITransactionManager"  , owner);
        });
        it("should save and publish MaxDiffSaved if all input values are within range", async function() {
            const response = await transactionLimiter.setMaxDiff(1, MAX_DIFF);

            await assertEqual(transactionLimiter.sequenceNum(), 1);
            await assertEqual(transactionLimiter.maxDiff(), MAX_DIFF);

            assert.equal(response.logs[0].event, "MaxDiffSaved");
            assert.equal(response.logs[0].args._maxDiff , MAX_DIFF);
        });
        it("should not save and publish MaxDiffNotSaved if sequence num is not valid", async function() {
            await transactionLimiter.setMaxDiff(1, MAX_DIFF);
            const response = await transactionLimiter.setMaxDiff(1, 3);

            await assertEqual(transactionLimiter.sequenceNum(), 1);
            await assertEqual(transactionLimiter.maxDiff(), MAX_DIFF);

            assert.equal(response.logs[0].event, "MaxDiffNotSaved");
            assert.equal(response.logs[0].args._maxDiff , 3);
        });
    });
});
