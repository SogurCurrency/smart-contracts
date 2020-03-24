contract("WalletsTradingDataSourceUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let walletsTradingDataSource;

    const LIMIT  = 1000;
    const owner  = accounts[0];
    const nonOwner  = accounts[1];
    const wallet = accounts[1];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        walletsTradingDataSource           = await artifacts.require("WalletsTradingDataSource"                ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        it("function updateWallet should abort with an error if called by a non-user", async function() {
            await catchRevert(walletsTradingDataSource.updateWallet(wallet, 0, 0, {from: owner}));
        });

        it("function resetWallets should abort with an error if called by a non-administrator", async function() {
            await catchRevert(walletsTradingDataSource.resetWallets([wallet], {from: owner}));
        });

         it("function setAuthorizedExecutorsIdentifier should abort with an error if called by a non-administrator", async function() {
            await catchRevert(walletsTradingDataSource.setAuthorizedExecutorsIdentifier(["_Some_Identifier_"], {from: nonOwner}));
        });


        after(async function() {
            await walletsTradingDataSource.accept(owner, {from: owner});
            await contractAddressLocatorProxy.setIsContractAddressRelatesResult("true");
        });
    });

    describe("functionality assertion:", function() {

        it("authorizedExecutorsIdentifier should be fail to set via non owner", async function() {
            await catchRevert(walletsTradingDataSource.setAuthorizedExecutorsIdentifier(["_Some_Identifier_"], {from: nonOwner}));
        });

        it("authorizedExecutorsIdentifier should be set via owner", async function() {
            await catchInvalidOpcode(walletsTradingDataSource.authorizedExecutorsIdentifier.call(0));
            await catchInvalidOpcode(walletsTradingDataSource.authorizedExecutorsIdentifier.call(1));

            await walletsTradingDataSource.setAuthorizedExecutorsIdentifier(["_Some_Identifier_"], {from: owner});
            assert.equal("_Some_Identifier_", web3.toUtf8(await walletsTradingDataSource.authorizedExecutorsIdentifier.call(0)));

            await walletsTradingDataSource.setAuthorizedExecutorsIdentifier(["_Some_Identifier_1", "_Some_Identifier_2"], {from: owner});
            assert.equal("_Some_Identifier_1", web3.toUtf8(await walletsTradingDataSource.authorizedExecutorsIdentifier.call(0)));
            assert.equal("_Some_Identifier_2", web3.toUtf8(await walletsTradingDataSource.authorizedExecutorsIdentifier.call(1)));
        });
        it("function updateWallet should abort if limit is 0", async function() {
                            await catchRevert(walletsTradingDataSource.updateWallet(wallet, 1, 0));
                            await assertEqual(walletsTradingDataSource.values(wallet), 0);
                        });
        it("function updateWallet should increase the value if not exceeding the limit", async function() {
            await walletsTradingDataSource.updateWallet(wallet, LIMIT, LIMIT);
            await assertEqual(walletsTradingDataSource.values(wallet), LIMIT);
        });

        it("function updateWallet should not increase the value if exceeding the limit", async function() {
            await catchRevert(walletsTradingDataSource.updateWallet(wallet, 1, LIMIT));
            await assertEqual(walletsTradingDataSource.values(wallet), LIMIT);
        });
        it("function resetWallets should set the value to zero", async function() {
            await walletsTradingDataSource.resetWallets([wallet]);
            await assertEqual(walletsTradingDataSource.values(wallet), 0);
        });
    });

    describe("modifier onlyWalletsTradingLimiters:", function() {
        beforeEach(async function() {
             contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
             walletsTradingDataSource           = await artifacts.require("WalletsTradingDataSourceExposure").new(contractAddressLocatorProxy.address);
        });
        it("should abort with an error if isSenderAddressRelates return false", async function() {
             await contractAddressLocatorProxy.setIsContractAddressRelatesResult("false");
             await catchRevert(walletsTradingDataSource.modifierOnlyAuthorizedExecutors());
        });
        it("should succeed if isSenderAddressRelates return true", async function() {
             await contractAddressLocatorProxy.setIsContractAddressRelatesResult("true");
             await walletsTradingDataSource.modifierOnlyAuthorizedExecutors();
        });
    });
});
