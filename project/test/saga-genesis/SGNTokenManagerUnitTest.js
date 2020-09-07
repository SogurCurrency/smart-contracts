contract("SGNTokenManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgnAuthorizationManager;
    let sgnConversionManager;
    let mintManager;
    let sgnTokenManager;
    let walletsTradingLimiterMockup;

    const AMOUNT = 1000;

    const owner        = accounts[0];
    const senderWallet = accounts[1];
    const targetWallet = accounts[2];
    const sourceWallet = accounts[3];

    const nullAddress = require("../utilities.js").address(0);
    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        sgnAuthorizationManager     = await artifacts.require("SGNAuthorizationManagerMockup"    ).new();
        sgnConversionManager           = await artifacts.require("SGNConversionManagerMockup"          ).new();
        mintManager                 = await artifacts.require("MintManagerMockup"                ).new();
        sgnTokenManager             = await artifacts.require("SGNTokenManager"                  ).new(contractAddressLocatorProxy.address);
        walletsTradingLimiterMockup              = await artifacts.require("WalletsTradingLimiterMockup"             ).new();
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("ISGNAuthorizationManager", sgnAuthorizationManager.address);
            await contractAddressLocatorProxy.set("ISGNConversionManager"      , sgnConversionManager      .address);
            await contractAddressLocatorProxy.set("IMintManager"            , mintManager            .address);
            await contractAddressLocatorProxy.set("WalletsTLSGNTokenManager"         , walletsTradingLimiterMockup         .address);
            await sgnAuthorizationManager.setState(true);
            await sgnConversionManager.setRatio(1);
        });
        it("function exchangeSgnForSga should abort with an error if called by a non-user", async function() {
            await catchRevert(sgnTokenManager.exchangeSgnForSga(senderWallet, AMOUNT, {from: owner}));
        });
        it("function uponTransfer should abort with an error if called by a non-user", async function() {
            await catchRevert(sgnTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT, {from: owner}));
        });
        it("function uponTransferFrom should abort with an error if called by a non-user", async function() {
            await catchRevert(sgnTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT, {from: owner}));
        });
        it("function uponMintSgnVestedInDelay should abort with an error if called by a non-user", async function() {
            await catchRevert(sgnTokenManager.uponMintSgnVestedInDelay(AMOUNT, {from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("ISGNToken", owner);
        });
    });

    describe("functionality assertion:", function() {
        beforeEach(async function() {
            await walletsTradingLimiterMockup.setPass(true);
        });
        it("function exchangeSgnForSga should complete successfully", async function() {
            await verifyEvent(sgnTokenManager.exchangeSgnForSga(senderWallet, AMOUNT), "ExchangeSgnForSgrCompleted");
        });
        it("function uponTransfer should complete successfully", async function() {
            await verifyEvent(sgnTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT), "");
        });
        it("function uponTransfer should abort if exceed limit", async function() {
            await walletsTradingLimiterMockup.setPass(false);
            await catchRevert(sgnTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT));
        });
        it("function uponTransferFrom should complete successfully", async function() {
            await verifyEvent(sgnTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT), "");
        });
        it("function uponTransferFrom should abort if exceed limit", async function() {
            await walletsTradingLimiterMockup.setPass(false);
            await catchRevert(sgnTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT));
        });
        it("function uponMintSgnVestedInDelay should complete successfully", async function() {
            await verifyEvent(sgnTokenManager.uponMintSgnVestedInDelay(AMOUNT), "MintSgnVestedInDelayCompleted");
        });
    });

    describe("token-selling assertion:", function() {
        before(async function() {
            await sgnConversionManager.setRatio(0);
        });
        it("function exchangeSgnForSga should abort with an error if returned amount is 0", async function() {
            await catchRevert(sgnTokenManager.exchangeSgnForSga(senderWallet, AMOUNT));
        });
        after(async function() {
            await sgnConversionManager.setRatio(1);
        });
    });

    describe("authorization assertion:", function() {
        before(async function() {
            await sgnAuthorizationManager.setState(false);
        });
        it("function exchangeSgnForSga should abort with an error if unauthorized", async function() {
            await catchRevert(sgnTokenManager.exchangeSgnForSga(senderWallet, AMOUNT));
        });
        it("function uponTransfer should abort with an error if unauthorized", async function() {
            await catchRevert(sgnTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT));
        });
        it("function uponTransferFrom should abort with an error if unauthorized", async function() {
            await catchRevert(sgnTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT));
        });
        after(async function() {
            await sgnAuthorizationManager.setState(true);
        });
    });

    describe("conversion assertion:", function() {
        it("function convertSgnToSgr should return the correct amount", async function() {
            const amount = await sgnTokenManager.convertSgnToSga(AMOUNT);
            assert(amount.equals(AMOUNT), `expected = ${AMOUNT}, actual = ${amount}`);
        });
        it("function convertSgnToSgr should abort with an error if MintManager is not connected", async function() {
            await contractAddressLocatorProxy.set("IMintManager", nullAddress);
            await catchRevert(sgnTokenManager.convertSgnToSga(AMOUNT));
            await contractAddressLocatorProxy.set("IMintManager", mintManager.address);
        });
    });

    async function verifyEvent(promise, expected) {
        const response = await promise;
        const logs     = response.logs;
        const actual   = logs && logs[0] ? logs[0].event : "";
        assert(actual == expected, `expected = ${expected}, actual = ${actual}`);
    }
});
