contract("TransactionManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let monetaryModel;
    let reconciliationAdjuster;
    let transactionLimiter;
    let ethConverter;
    let transactionManager;

    const AMOUNT = 1000;
    const owner  = accounts[0];

    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        monetaryModel                   = await artifacts.require("MonetaryModelMockup"                  ).new();
        reconciliationAdjuster           = await artifacts.require("ReconciliationAdjusterMockup"          ).new();
        transactionLimiter          = await artifacts.require("TransactionLimiterMockup"         ).new();
        ethConverter        = await artifacts.require("ETHConverterMockup"       ).new();
        transactionManager          = await artifacts.require("TransactionManager"               ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("IMonetaryModel"           , monetaryModel           .address);
            await contractAddressLocatorProxy.set("IReconciliationAdjuster"   , reconciliationAdjuster   .address);
            await contractAddressLocatorProxy.set("ITransactionLimiter"  , transactionLimiter  .address);
            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
        });
        it("function buy should abort with an error if called by a non-user", async function() {
            await catchRevert(transactionManager.buy(AMOUNT, {from: owner}));
        });
        it("function sell should abort with an error if called by a non-user", async function() {
            await catchRevert(transactionManager.sell(AMOUNT, {from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("ISGRTokenManager", owner);
        });
    });

    describe("functionality assertion:", function() {
        it("function buy", async function() {
            await test(transactionManager.buy, AMOUNT, "TransactionManagerBuyCompleted");
        });
        it("function sell", async function() {
            await test(transactionManager.sell, AMOUNT, "TransactionManagerSellCompleted");
        });
    });

    async function test(func, amount, event) {
        const response = await func(amount);
        const log      = response.logs[0];
        const expected = `event: ${    event}, amount: ${          amount}`;
        const actual   = `event: ${log.event}, amount: ${log.args._amount}`;
        assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
    }
});
