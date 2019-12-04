contract("SGNTokenFuncTest", function(accounts) {
    let contractAddressLocatorProxy;
    let authorizationDataSource;
    let sgnAuthorizationManager;
    let sgnConversionManager;
    let tradingClasses;
    let walletsTradingLimiterValueConverter;
    let walletsTradingDataSource;
    let sgnTokenManager;
    let sgnWalletsTradingLimiter;
    let sagaExchanger;
    let mintManager;
    let sgnToken;
    let contractAddressLocator;

    const owner              = accounts[0];
    const initWallet         = accounts[1];
    const mainWallet         = accounts[2];
    const authorizedWallet   = accounts[3];
    const unauthorizedWallet = accounts[4];
    const unregisteredWallet = accounts[5];

    const unzip       = require("../utilities.js").unzip;
    const catchRevert = require("../exceptions.js").catchRevert;

    const initialBalance   = web3.toBigNumber("6000000000000000000");
    const amountToTransfer = web3.toBigNumber("1000000000000000000");

    const arrayLength   = require("./helpers/SGNConversionManager.js").arrayLength;
    const minValidIndex = require("./helpers/SGNConversionManager.js").minValidIndex;

    describe("function transfer:", function() {
        beforeEach(async function() {
            await init();
            await load();
        });
        it("sender = mainWallet, to = authorizedWallet", async function() {
            await sgnToken.transfer(authorizedWallet, amountToTransfer, {from: mainWallet});
            await assertBalance(mainWallet      , initialBalance.minus(amountToTransfer));
            await assertBalance(authorizedWallet, initialBalance.plus (amountToTransfer));
        });
        it("sender = authorizedWallet, to = mainWallet", async function() {
            await sgnToken.transfer(mainWallet, amountToTransfer, {from: authorizedWallet});
            await assertBalance(mainWallet      , initialBalance.plus (amountToTransfer));
            await assertBalance(authorizedWallet, initialBalance.minus(amountToTransfer));
        });
        it("sender = mainWallet, to = unauthorizedWallet", async function() {
            await catchRevert(sgnToken.transfer(unauthorizedWallet, amountToTransfer, {from: mainWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unauthorizedWallet, initialBalance);
        });
        it("sender = unauthorizedWallet, to = mainWallet", async function() {
            await catchRevert(sgnToken.transfer(mainWallet, amountToTransfer, {from: unauthorizedWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unauthorizedWallet, initialBalance);
        });
        it("sender = mainWallet, to = unregisteredWallet", async function() {
            await catchRevert(sgnToken.transfer(unregisteredWallet, amountToTransfer, {from: mainWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unregisteredWallet, initialBalance);
        });
        it("sender = unregisteredWallet, to = mainWallet", async function() {
            await catchRevert(sgnToken.transfer(mainWallet, amountToTransfer, {from: unregisteredWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unregisteredWallet, initialBalance);
        });
    });

    describe("function transferFrom:", function() {
        beforeEach(async function() {
            await init();
            await load();
        });
        it("sender = initWallet, from = mainWallet, to = authorizedWallet", async function() {
            await sgnToken.transferFrom(mainWallet, authorizedWallet, amountToTransfer, {from: initWallet});
            await assertBalance(mainWallet      , initialBalance.minus(amountToTransfer));
            await assertBalance(authorizedWallet, initialBalance.plus (amountToTransfer));
        });
        it("sender = initWallet, from = authorizedWallet, to = mainWallet", async function() {
            await sgnToken.transferFrom(authorizedWallet, mainWallet, amountToTransfer, {from: initWallet});
            await assertBalance(mainWallet      , initialBalance.plus (amountToTransfer));
            await assertBalance(authorizedWallet, initialBalance.minus(amountToTransfer));
        });
        it("sender = initWallet, from = mainWallet, to = unauthorizedWallet", async function() {
            await catchRevert(sgnToken.transferFrom(mainWallet, unauthorizedWallet, amountToTransfer, {from: initWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unauthorizedWallet, initialBalance);
        });
        it("sender = initWallet, from = unauthorizedWallet, to = mainWallet", async function() {
            await catchRevert(sgnToken.transferFrom(unauthorizedWallet, mainWallet, amountToTransfer, {from: initWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unauthorizedWallet, initialBalance);
        });
        it("sender = initWallet, from = mainWallet, to = unregisteredWallet", async function() {
            await catchRevert(sgnToken.transferFrom(mainWallet, unregisteredWallet, amountToTransfer, {from: initWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unregisteredWallet, initialBalance);
        });
        it("sender = initWallet, from = unregisteredWallet, to = mainWallet", async function() {
            await catchRevert(sgnToken.transferFrom(unregisteredWallet, mainWallet, amountToTransfer, {from: initWallet}));
            await assertBalance(mainWallet        , initialBalance);
            await assertBalance(unregisteredWallet, initialBalance);
        });
    });

    describe("function transfer when selling:", function() {
        beforeEach(async function() {
            await init();
            await load();
            await mintManager.setIndex(minValidIndex);
            await sagaExchanger.mintSgaForSgnHolders(amountToTransfer);
        });
        it("sender = authorizedWallet", async function() {
            await sgnToken.transfer(sgnToken.address, amountToTransfer, {from: authorizedWallet});
            await assertBalance(authorizedWallet, initialBalance.minus(amountToTransfer));
        });
        it("sender = unauthorizedWallet", async function() {
            await catchRevert(sgnToken.transfer(sgnToken.address, amountToTransfer, {from: unauthorizedWallet}));
            await assertBalance(unauthorizedWallet, initialBalance);
        });
        it("sender = unregisteredWallet", async function() {
            await catchRevert(sgnToken.transfer(sgnToken.address, amountToTransfer, {from: unregisteredWallet}));
            await assertBalance(unregisteredWallet, initialBalance);
        });
    });

    describe("function convert:", function() {
        let MAX_AMOUNT ;
        let DENOMINATOR;
        before(async function() {
            await init();
            MAX_AMOUNT  = await sgnConversionManager.MAX_AMOUNT ();
            DENOMINATOR = await sgnConversionManager.DENOMINATOR();
        });
        for (let index = 0; index < arrayLength; index++) {
            it(`index ${index}`, async function() {
                await mintManager.setIndex(index);
                const numerator = await sgnConversionManager.numerators(index);
                const actual    = await sgnToken.convert(MAX_AMOUNT);
                const expected  = numerator.div(DENOMINATOR).times(MAX_AMOUNT).truncated();
                assert(expected.equals(actual), `expected = ${expected.toFixed()}, actual = ${actual.toFixed()}`);
            });
        }
    });

    describe("token-selling:", function() {
        const sgnAmount = 1000000;
        before(async function() {
            await init();
            await authorizationDataSource.upsertOne(initWallet, Date.now(), true, -1, -1, 0);
        });
        for (let index = minValidIndex; index < arrayLength; index++) {
            it(`index ${index}`, async function() {
                await mintManager.setIndex(index);
                const prevState = await getState(initWallet);
                const sgaAmount = await sgnToken.convert(sgnAmount);
                await sagaExchanger.mintSgaForSgnHolders(sgaAmount);
                await sgnToken.transfer(sgnToken.address, sgnAmount, {from: initWallet});
                const nextState = await getState(initWallet);
                assert(prevState.sgn.minus(nextState.sgn).equals(sgnAmount), `sgn: ${prevState.sgn} - ${nextState.sgn} != ${sgnAmount}`);
                assert(nextState.sga.minus(prevState.sga).equals(sgaAmount), `sga: ${nextState.sga} - ${prevState.sga} != ${sgaAmount}`);
            });
        }
    });

    async function init() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxy").new();
        authorizationDataSource     = await artifacts.require("AuthorizationDataSource"    ).new();
        sgnAuthorizationManager     = await artifacts.require("SGNAuthorizationManager"    ).new(contractAddressLocatorProxy.address);
        sgnConversionManager        = await artifacts.require("SGNConversionManager"       ).new();
        tradingClasses              = await artifacts.require("TradingClasses"             ).new();
        walletsTradingLimiterValueConverter                = await artifacts.require("WalletsTradingLimiterValueConverter"               ).new();
        walletsTradingDataSource    = await artifacts.require("WalletsTradingDataSource"   ).new(contractAddressLocatorProxy.address);
        sgnTokenManager             = await artifacts.require("SGNTokenManager"            ).new(contractAddressLocatorProxy.address);
        sgnWalletsTradingLimiter    = await artifacts.require("SGNWalletsTradingLimiter"   ).new(contractAddressLocatorProxy.address);
        sagaExchanger               = await artifacts.require("SagaExchangerMockup"        ).new();
        mintManager                 = await artifacts.require("MintManagerMockup"          ).new();
        sgnToken                    = await artifacts.require("SGNToken"                   ).new(contractAddressLocatorProxy.address, initWallet);
        contractAddressLocator      = await artifacts.require("ContractAddressLocator"     ).new(...unzip([
            ["IAuthorizationDataSource", authorizationDataSource.address],
            ["ISGNAuthorizationManager", sgnAuthorizationManager.address],
            ["ISGNConversionManager"      , sgnConversionManager      .address],
            ["ITradingClasses"         , tradingClasses         .address],
            ["IWalletsTLValueConverter"           , walletsTradingLimiterValueConverter           .address],
            ["IWalletsTradingDataSource"      , walletsTradingDataSource      .address],
            ["ISGNTokenManager"        , sgnTokenManager        .address],
            ["WalletsTLSGNTokenManager"  , sgnWalletsTradingLimiter         .address],
            ["ISagaExchanger"          , sagaExchanger          .address],
            ["IMintManager"            , mintManager            .address],
            ["ISGNToken"               , sgnToken               .address],
        ]));
        await contractAddressLocatorProxy.upgrade(contractAddressLocator.address);
        await authorizationDataSource.accept(owner);
        await walletsTradingLimiterValueConverter.accept(owner);
    }

    async function load() {
        await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(1,1,1,{from: owner});
        await walletsTradingLimiterValueConverter.setPrice(1,1,1,{from: owner});

        await authorizationDataSource.upsertOne(initWallet, Date.now(), true, -1, -1, 0);
        for (const wallet of [mainWallet, authorizedWallet, unauthorizedWallet, unregisteredWallet]) {
            await authorizationDataSource.upsertOne(wallet, Date.now(), true, -1, -1, 0);
            await sgnToken.transfer(wallet, initialBalance, {from: initWallet});
            await sgnToken.approve(initWallet, amountToTransfer, {from: wallet});
        }
        await authorizationDataSource.upsertOne(unauthorizedWallet, Date.now(), false, 0, 0, 0);
        await authorizationDataSource.removeOne(unregisteredWallet);
    }

    async function getState(wallet) {
        return {sgn: await sgnToken.balanceOf(wallet), sga: await sagaExchanger.balanceOf(wallet)};
    }

    async function assertBalance(wallet, expected) {
        const actual = await sgnToken.balanceOf(wallet);
        assert(actual.equals(expected), `expected = ${expected.toFixed()}, actual = ${actual.toFixed()}`);
    }
});
