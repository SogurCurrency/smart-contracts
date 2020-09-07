contract("ContractAddressLocatorProxyUnitTest", function(accounts) {
    let contractAddressLocator;
    let contractAddressLocatorProxy;

    const INTERFACE = "ABC";
    const INTERFACE2 = "ABCD";

    const owner    = accounts[0];
    const nonOwner = accounts[1];
    const contract = accounts[2];
    const contract2 = accounts[3];

    const nullAddress = require("../utilities.js").address(0);
    const catchRevert = require("../exceptions.js").catchRevert;

    beforeEach(async function() {
        contractAddressLocator      = await artifacts.require("ContractAddressLocatorMockup").new();
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxy" ).new();
    });

    describe("security assertion:", function() {
        it("function upgrade should abort with an error if called with a null argument", async function() {
            await catchRevert(contractAddressLocatorProxy.upgrade(nullAddress, {from: owner}));
        });
        it("function upgrade should abort with an error if called by a non-owner", async function() {
            await catchRevert(contractAddressLocatorProxy.upgrade(contractAddressLocator.address, {from: nonOwner}));
        });
    });

    describe("function upgrade:", function() {
        it("validate", async function() {
            const response = await contractAddressLocatorProxy.upgrade(contractAddressLocator.address);
            assert.equal(response.logs[0].event, "Upgraded");
            assert.equal(response.logs[0].args._prev, nullAddress);
            assert.equal(response.logs[0].args._next, contractAddressLocator.address);
        });
    });
    describe("functionality assertion:", function() {
        beforeEach(async function() {
            await contractAddressLocatorProxy.upgrade(contractAddressLocator.address);
        });

        it("function getContractAddress", async function() {
            await contractAddressLocator.set(INTERFACE, contract);
            const actual = await contractAddressLocatorProxy.getContractAddress(INTERFACE);
            assert.equal(actual, contract);
        });
        it("function isContractAddressRelates", async function() {
            await contractAddressLocator.setIsContractAddressRelatesExpectedParams(nullAddress, ["1", "2"]);
            assert.equal(await contractAddressLocatorProxy.isContractAddressRelates(nullAddress, ["1", "2"]), true);

            await contractAddressLocator.setIsContractAddressRelatesExpectedParams(accounts[0], ["1", "2"]);
            assert.equal(await contractAddressLocatorProxy.isContractAddressRelates(accounts[0], ["1", "2"]), true);

            await contractAddressLocator.setIsContractAddressRelatesExpectedParams(accounts[0], ["1", "2"]);
            assert.equal(await contractAddressLocatorProxy.isContractAddressRelates(accounts[0], ["1"]), false);
        });
        it("function getContractAddressLocator", async function() {
            const actual = await contractAddressLocatorProxy.getContractAddressLocator();
            assert.equal(actual, contractAddressLocator.address);
        });
    });
});
