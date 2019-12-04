contract("ContractAddressLocatorHolderUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let contractAddressLocatorHolder;

    const INTERFACE1 = "1";
    const INTERFACE2 = "2";
    const INTERFACE3 = "3";

    const contract1 = accounts[1];
    const contract2 = accounts[2];
    const contract3 = accounts[3];
    const contract4 = accounts[4];

    const nullAddress = require("../utilities.js").address(0);
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;
    const assertEqualArray = require("../utilities.js").assertEqualArray;

    describe("security assertion:", function() {
        it("constructor should abort with an error if called with a null argument", async function() {
            await catchRevert(artifacts.require("ContractAddressLocatorHolderExposure").new(nullAddress));
        });
    });

    describe("functionality assertion:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy  = await artifacts.require("ContractAddressLocatorProxyMockup"   ).new();
            contractAddressLocatorHolder = await artifacts.require("ContractAddressLocatorHolderExposure").new(contractAddressLocatorProxy.address);
            await contractAddressLocatorProxy.set(INTERFACE1, contract1);
        });
        it("function getContractAddressLocator", async function() {
            assert.equal(await contractAddressLocatorHolder.getContractAddressLocator(), contractAddressLocatorProxy.address);
        });
        it("function getContractAddress", async function() {
            assert.equal(await contractAddressLocatorHolder.functionGetContractAddress(INTERFACE1), contract1  );
            assert.equal(await contractAddressLocatorHolder.functionGetContractAddress(INTERFACE2), nullAddress);
        });
        it("modifier only", async function() {
            await             contractAddressLocatorHolder.modifierOnly(INTERFACE1, {from: contract1} );
            await catchRevert(contractAddressLocatorHolder.modifierOnly(INTERFACE1, {from: contract2}));
            await catchRevert(contractAddressLocatorHolder.modifierOnly(INTERFACE2, {from: contract1}));
            await catchRevert(contractAddressLocatorHolder.modifierOnly(INTERFACE2, {from: contract2}));
        });
    });

    describe("function  isSenderAddressRelates:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy  = await artifacts.require("ContractAddressLocatorProxyMockup"   ).new();
            contractAddressLocatorHolder = await artifacts.require("ContractAddressLocatorHolderExposure").new(contractAddressLocatorProxy.address);
        });
        it("should send the msg sender as the lookup contract address", async function() {
            await contractAddressLocatorProxy.setIsContractAddressRelatesResult("check_contract_address");

            await contractAddressLocatorProxy.setIsContractAddressRelatesExpectedContractAddress(accounts[1]);
            assert.equal(await contractAddressLocatorHolder.functionIsSenderAddressRelates([], {from: contract1}), true);

            await contractAddressLocatorProxy.setIsContractAddressRelatesExpectedContractAddress(accounts[0]);
            assert.equal(await contractAddressLocatorHolder.functionIsSenderAddressRelates([]), true);
        });
        it("should return the contract address locator result", async function() {
            await contractAddressLocatorProxy.setIsContractAddressRelatesResult("true");
            assert.equal(await contractAddressLocatorHolder.functionIsSenderAddressRelates([]), true);

            await contractAddressLocatorProxy.setIsContractAddressRelatesResult("false");
            assert.equal(await contractAddressLocatorHolder.functionIsSenderAddressRelates([]), false);

            await contractAddressLocatorProxy.setIsContractAddressRelatesResult("require_fail");
            await catchRevert(contractAddressLocatorHolder.functionIsSenderAddressRelates([]));

            await contractAddressLocatorProxy.setIsContractAddressRelatesResult("check_identifiers");
            assert.equal(await contractAddressLocatorHolder.functionIsSenderAddressRelates(["one", "two"]), true);
        });

    });
});
