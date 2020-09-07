contract("ContractAddressLocatorUnitTest", function(accounts) {
    let contractAddressLocator;

    const contractAddresses       = accounts;
    const validIdentifiers     = accounts.map((x, n) => web3.fromAscii(`v${n}$`).padEnd(66, "0"));
    const invalidIdentifiers   = accounts.map((x, n) => web3.fromAscii(`i${n}$`).padEnd(66, "0"));
    const duplicateIdentifiers = accounts.map((x, n) => web3.fromAscii(`d${0}$`).padEnd(66, "0"));

    const nullAddress = require("../utilities.js").address(0);
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    describe("security assertion:", function() {
        it("constructor should abort with an error if there are less identifiers than contract addresses", async function() {
            await catchRevert(artifacts.require("ContractAddressLocator").new(validIdentifiers.slice(1), contractAddresses));
        });
        it("constructor should abort with an error if there are more identifiers than contract addresses", async function() {
            await catchRevert(artifacts.require("ContractAddressLocator").new(validIdentifiers, contractAddresses.slice(1)));
        });
        it("constructor should abort with an error if the same identifier is used more than once", async function() {
            await catchRevert(artifacts.require("ContractAddressLocator").new(duplicateIdentifiers, contractAddresses));
        });
    });

    describe("functionality assertion:", function() {
        it("constructor events", async function() {
            contractAddressLocator = await artifacts.require("ContractAddressLocator").new(validIdentifiers, contractAddresses);
            artifacts.require("ContractAddressLocator").at(contractAddressLocator.address).allEvents().get(function(error, logs) {
                assert.equal(error, null);
                assert.equal(logs.length, accounts.length);
                for (let i = 0; i < logs.length; i++) {
                    assert.equal(logs[i].event, "Mapped");
                    assert.equal(logs[i].args._identifier, validIdentifiers[i]);
                    assert.equal(logs[i].args._contractAddress, contractAddresses[i]);
                }
            });
        });
        it("function getContractAddress should return the correct address when called with a valid identifier", async function() {
            for (let i = 0; i < accounts.length; i++)
                assert.equal(await contractAddressLocator.getContractAddress(validIdentifiers[i]), contractAddresses[i]);
        });
        it("function getContractAddress should return an invalid address when called with an invalid identifier", async function() {
            for (let i = 0; i < accounts.length; i++)
                assert.equal(await contractAddressLocator.getContractAddress(invalidIdentifiers[i]), nullAddress);
        });
    });



    describe("function isContractAddressRelates:", function() {
        let  relatedContractAddresses;
        let  contractAddressesIdentifiers       ;
        beforeEach(async function() {
            relatedContractAddresses                  = [accounts[0], accounts[1], accounts[2]];
            contractAddressesIdentifiers       = ["1", "2", "3"];
            contractAddressLocator = await artifacts.require("ContractAddressLocator").new(contractAddressesIdentifiers, relatedContractAddresses);
        });

        it("should abort with an error if called with identifiers count greater from total identifiers exists ", async function() {
            await catchRevert(contractAddressLocator.isContractAddressRelates(relatedContractAddresses[0], ["1", "2", "3", "4"]));
        });
        it("should abort with an error if called with a null contract address", async function() {
            await catchInvalidOpcode(contractAddressLocator.isContractAddressRelates(nullAddress, contractAddressesIdentifiers));
        });
        it("should return false if called with non exists identifiers", async function() {
            assert.equal(await contractAddressLocator.isContractAddressRelates(relatedContractAddresses[0], ["n1", "n2", "n3"]), false);
        });
        it("should return false if called with an empty identifiers", async function() {
            assert.equal(await contractAddressLocator.isContractAddressRelates(relatedContractAddresses[0], []), false);
        });
        it("should return false if called with a not related contract address", async function() {
            assert.equal(await contractAddressLocator.isContractAddressRelates(accounts[3], contractAddressesIdentifiers), false);
        });
        it("should return true if called with a contract address that relates to one of the identifiers", async function() {
            assert.equal(await contractAddressLocator.isContractAddressRelates(relatedContractAddresses[0], contractAddressesIdentifiers), true);
        });
    });
});
