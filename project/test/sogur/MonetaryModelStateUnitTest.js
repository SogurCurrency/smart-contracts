contract("MonetaryModelStateUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let monetaryModelState;

    const AMOUNT = 1000000;
    const owner  = accounts[0];

    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        monetaryModelState              = await artifacts.require("MonetaryModelState"                   ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        it("function setSdrTotal should abort with an error if called by a non-user", async function() {
            await catchRevert(monetaryModelState.setSdrTotal(AMOUNT, {from: owner}));
        });
        it("function setSgrTotal should abort with an error if called by a non-user", async function() {
            await catchRevert(monetaryModelState.setSgrTotal(AMOUNT, {from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("IMonetaryModel", owner);
        });
    });

    describe("functionality assertion:", function() {
        it("function setSdrTotal", async function() {
            await monetaryModelState.setSdrTotal(AMOUNT);
            const amount = await monetaryModelState.getSdrTotal();
            assert(amount.equals(AMOUNT), `expected = ${AMOUNT}, actual = ${amount}`);
        });
        it("function setSgrTotal", async function() {
            await monetaryModelState.setSgrTotal(AMOUNT);
            const amount = await monetaryModelState.getSgrTotal();
            assert(amount.equals(AMOUNT), `expected = ${AMOUNT}, actual = ${amount}`);
        });
    });

    describe("init function assertions:", function() {
        let validExecutor = accounts[5];
        let validSDRTotal = 1000;
        let validSGRTotal = 1001;

        beforeEach(async function() {
           contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
           monetaryModelState              = await artifacts.require("MonetaryModelState"                   ).new(contractAddressLocatorProxy.address);
           await contractAddressLocatorProxy.set("SGAToSGRInitializer", validExecutor);
        });

        it("should abort with an error if called by not authorized", async function() {
           await catchRevert(monetaryModelState.init(validSDRTotal, validSGRTotal, {from: owner}));
        });

        it("should abort with an error if already initialized", async function() {
           await monetaryModelState.init(validSDRTotal, validSGRTotal, {from: validExecutor});
           await catchRevert(monetaryModelState.init(validSDRTotal, validSGRTotal, {from: validExecutor}));
        });

        it("should succeed and set sdr and sgr total amounts", async function() {
           await monetaryModelState.init(validSDRTotal, validSGRTotal, {from: validExecutor});
           assert(await monetaryModelState.sdrTotal.call(), validSDRTotal);
           assert(await monetaryModelState.sgrTotal.call(), validSGRTotal);
        });
    });
});
