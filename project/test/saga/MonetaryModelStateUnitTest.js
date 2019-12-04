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
        it("function setSgaTotal should abort with an error if called by a non-user", async function() {
            await catchRevert(monetaryModelState.setSgaTotal(AMOUNT, {from: owner}));
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
        it("function setSgaTotal", async function() {
            await monetaryModelState.setSgaTotal(AMOUNT);
            const amount = await monetaryModelState.getSgaTotal();
            assert(amount.equals(AMOUNT), `expected = ${AMOUNT}, actual = ${amount}`);
        });
    });
});
