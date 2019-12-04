contract("WalletsTradingDataSourceUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let walletsTradingDataSource;

    const LIMIT  = 1000;
    const owner  = accounts[0];
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
        after(async function() {
            await walletsTradingDataSource.accept(owner, {from: owner});
            await contractAddressLocatorProxy.setIsContractAddressRelatesResult("true");
        });
    });

    describe("functionality assertion:", function() {
        it("walletTradingLimitersContractLocatorIdentifier should be init with SGN and SGA token managers identifiers", async function() {
            const walletTradingLimitersContractLocatorIdentifierSGN_MANAGER = await walletsTradingDataSource.walletTradingLimitersContractLocatorIdentifier.call(0);
            const walletTradingLimitersContractLocatorIdentifierSGA_MANAGER = await walletsTradingDataSource.walletTradingLimitersContractLocatorIdentifier.call(1);
            await catchInvalidOpcode(walletsTradingDataSource.walletTradingLimitersContractLocatorIdentifier.call(2));

            assert.equal("WalletsTLSGNTokenManager", web3.toUtf8(walletTradingLimitersContractLocatorIdentifierSGN_MANAGER));
            assert.equal("WalletsTLSGATokenManager", web3.toUtf8(walletTradingLimitersContractLocatorIdentifierSGA_MANAGER));

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
              await catchRevert(walletsTradingDataSource.modifierOnlyWalletsTradingLimiters());
        });
        it("should succeed if isSenderAddressRelates return true", async function() {
        await contractAddressLocatorProxy.setIsContractAddressRelatesResult("true");
                      await walletsTradingDataSource.modifierOnlyWalletsTradingLimiters();
                });
    });
});
