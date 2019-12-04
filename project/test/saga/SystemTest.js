contract("SystemTest", function(accounts) {
    const owner  = accounts[0];
    const admin  = accounts[1];
    const wallet = accounts[2];

    const DIR    = "test/saga/helpers/sequences";
    const files  = require("fs").readdirSync(DIR);
    const unzip  = require("../utilities.js").unzip;
    const decode = require("../utilities.js").decode;

    const params = [
        {name: "user"  , size: 160, indexed: true },
        {name: "input" , size: 256, indexed: false},
        {name: "output", size: 256, indexed: false},
    ];

    describe("functional assertion:", function() {
        let contractAddressLocatorProxy;
        let redButton;
        let modelDataSource;
        let modelCalculator;
        let priceBandCalculator;
        let tradingClasses;
        let walletsTradingLimiterValueConverter;
        let reconciliationAdjuster;
        let sgnConversionManager;
        let authorizationDataSource;
        let sgnAuthorizationManager;
        let sgaAuthorizationManager;
        let ethConverter;
        let rateApprover;
        let transactionLimiter;
        let transactionManager;
        let walletsTradingDataSource;
        let sgnTokenManager;
        let sgaTokenManager;
        let sgaWalletsTradingLimiter;
        let reserveManager;
        let paymentManager;
        let paymentQueue;
        let monetaryModel;
        before(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxy").new();
            redButton                   = await artifacts.require("RedButton"                  ).new();
            modelDataSource                  = await artifacts.require("ModelDataSource"                 ).new();
            modelCalculator             = await artifacts.require("ModelCalculator"            ).new();
            priceBandCalculator            = await artifacts.require("PriceBandCalculator"           ).new();
            tradingClasses              = await artifacts.require("TradingClasses"             ).new();
            walletsTradingLimiterValueConverter            = await artifacts.require("WalletsTradingLimiterValueConverter"           ).new();
            reconciliationAdjuster           = await artifacts.require("ReconciliationAdjuster"          ).new();
            sgnConversionManager           = await artifacts.require("SGNConversionManager"          ).new();
            authorizationDataSource     = await artifacts.require("AuthorizationDataSource"    ).new();
            sgnAuthorizationManager     = await artifacts.require("SGNAuthorizationManager"    ).new(contractAddressLocatorProxy.address);
            sgaAuthorizationManager     = await artifacts.require("SGAAuthorizationManager"    ).new(contractAddressLocatorProxy.address);
            ethConverter        = await artifacts.require("ETHConverter"       ).new(contractAddressLocatorProxy.address);
            rateApprover          = await artifacts.require("RateApprover"         ).new(contractAddressLocatorProxy.address);
            transactionLimiter          = await artifacts.require("TransactionLimiter"         ).new(contractAddressLocatorProxy.address);
            transactionManager          = await artifacts.require("TransactionManager"         ).new(contractAddressLocatorProxy.address);
            walletsTradingDataSource           = await artifacts.require("WalletsTradingDataSource"          ).new(contractAddressLocatorProxy.address);
            sgnTokenManager             = await artifacts.require("SGNTokenManager"            ).new(contractAddressLocatorProxy.address);
            sgaTokenManager             = await artifacts.require("SGATokenManager"            ).new(contractAddressLocatorProxy.address);
            sgaWalletsTradingLimiter              = await artifacts.require("SGAWalletsTradingLimiter"                   ).new(contractAddressLocatorProxy.address);
            reserveManager              = await artifacts.require("ReserveManager"             ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                ).new(contractAddressLocatorProxy.address);
            paymentQueue                   = await artifacts.require("PaymentQueue"                  ).new(contractAddressLocatorProxy.address);
            monetaryModel                   = await artifacts.require("MonetaryModel"                  ).new(contractAddressLocatorProxy.address);
            await require("./helpers/ModelDataSource.js").initialize(modelDataSource);
            await authorizationDataSource.accept(admin, {from: owner});
            await authorizationDataSource.upsertOne(wallet, Date.now(), true, -1, -1, 0, {from: admin});
            await walletsTradingLimiterValueConverter.accept(owner);
            await ethConverter.accept(owner);
        });
        for (let m = 0; m < files.length; m++) {
            describe(`file ${files[m]}:`, function() {
                const file = require("../../" + DIR + "/" + files[m]);
                let mintingPointTimersManager;
                let mintManager;
                let intervalIterator;
                let monetaryModelState;
                let sgaToken;
                let sgnToken;
                let contractAddressLocator;
                let SGA_MINTED_FOR_SGN_HOLDERS;
                before(async function() {
                    mintingPointTimersManager            = await artifacts.require("MintingPointTimersManagerExposure"   ).new(contractAddressLocatorProxy.address, file.timeout);
                    mintManager            = await artifacts.require("MintManager"           ).new(contractAddressLocatorProxy.address);
                    intervalIterator       = await artifacts.require("IntervalIterator"      ).new(contractAddressLocatorProxy.address);
                    monetaryModelState         = await artifacts.require("MonetaryModelState"        ).new(contractAddressLocatorProxy.address);
                    sgaToken               = await artifacts.require("SGAToken"              ).new(contractAddressLocatorProxy.address);
                    sgnToken               = await artifacts.require("SGNToken"              ).new(contractAddressLocatorProxy.address, wallet);
                    contractAddressLocator = await artifacts.require("ContractAddressLocator").new(...unzip([
                        ["IRedButton"              , redButton              .address],
                        ["IModelDataSource"             , modelDataSource             .address],
                        ["IModelCalculator"        , modelCalculator        .address],
                        ["IPriceBandCalculator"       , priceBandCalculator       .address],
                        ["ITradingClasses"         , tradingClasses         .address],
                        ["IWalletsTLValueConverter"       , walletsTradingLimiterValueConverter       .address],
                        ["IReconciliationAdjuster"      , reconciliationAdjuster      .address],
                        ["ISGNConversionManager"      , sgnConversionManager      .address],
                        ["IAuthorizationDataSource", authorizationDataSource.address],
                        ["ISGNAuthorizationManager", sgnAuthorizationManager.address],
                        ["ISGAAuthorizationManager", sgaAuthorizationManager.address],
                        ["IETHConverter"   , ethConverter   .address],
                        ["ITransactionLimiter"     , transactionLimiter     .address],
                        ["ITransactionManager"     , transactionManager     .address],
                        ["IWalletsTradingDataSource"      , walletsTradingDataSource      .address],
                        ["ISGNTokenManager"        , sgnTokenManager        .address],
                        ["ISGATokenManager"        , sgaTokenManager        .address],
                        ["WalletsTLSGATokenManager"         , sgaWalletsTradingLimiter         .address],
                        ["IReserveManager"         , reserveManager         .address],
                        ["IPaymentManager"            , paymentManager            .address],
                        ["IPaymentQueue"              , paymentQueue              .address],
                        ["IMonetaryModel"              , monetaryModel              .address],
                        ["IMintingPointTimersManager"            , mintingPointTimersManager            .address],
                        ["IMintManager"            , mintManager            .address],
                        ["IIntervalIterator"       , intervalIterator       .address],
                        ["IMonetaryModelState"         , monetaryModelState         .address],
                        ["ISGAToken"               , sgaToken               .address],
                        ["IPaymentHandler"            , sgaToken               .address],
                        ["IMintListener"           , sgaToken               .address],
                        ["ISagaExchanger"          , sgaToken               .address],
                        ["ISGNToken"               , sgnToken               .address],
                        ["IMintHandler"            , sgnToken               .address],
                        ["IRateApprover"           , rateApprover               .address],
                    ]));
                    await contractAddressLocatorProxy.upgrade(contractAddressLocator.address);
                    SGA_MINTED_FOR_SGN_HOLDERS = await sgaToken.SGA_MINTED_FOR_SGN_HOLDERS();
                    await rateApprover.setRateBounds(1, "0x10000000000000000", 1, 1, "0x10000000000000000",{from: owner});
                    await walletsTradingLimiterValueConverter.setPrice(1,1,1,{from: owner});
                    await ethConverter.setPrice(1,1,1,1,1,{from: owner});
                    await reconciliationAdjuster.setFactor(1,1,1,{from: owner});
                });
                for (let n = 0; n < file.sequence.length; n++) {
                    const func = file.sequence[n].func;
                    const input = web3.toBigNumber(file.sequence[n].input);
                    const output = web3.toBigNumber(file.sequence[n].output);
                    const elapsed = web3.toBigNumber(file.sequence[n].elapsed);
                    it(`${func}(${input.toFixed()}) = ${output.toFixed()}`, async function() {
                        await mintingPointTimersManager.jump(elapsed);
                        const response = await eval(func)(sgaToken, input);
                        const decoded = decode(response, sgaTokenManager, 0, params);
                        const actual = web3.toBigNumber(decoded.output);
                        assert(actual.equals(output), `${func}(${input.toFixed()}) = ${actual.toFixed()}`);
                        await assertMinting(mintManager, sgnToken, sgaToken, SGA_MINTED_FOR_SGN_HOLDERS, file.sequence[n].minting);
                    });
                }
                const minting = file.sequence.slice(-1)[0].minting;
                if (web3.toBigNumber(minting.sga).greaterThan(0)) {
                    const input = web3.toBigNumber(minting.sgn);
                    const output = web3.toBigNumber(minting.sga);
                    it(`exec(${input.toFixed()}) = ${output.toFixed()}`, async function() {
                        const response = await exec(sgnToken, input);
                        const decoded = decode(response, sgnTokenManager, 0, params);
                        const actual = web3.toBigNumber(decoded.output);
                        assert(actual.equals(output), `exec(${input.toFixed()}) = ${actual.toFixed()}`);
                        await assertMinting(mintManager, sgnToken, sgaToken, SGA_MINTED_FOR_SGN_HOLDERS, {sgn: 0, sga: 0, index: minting.index});
                    });
                }
            });
        }
    });

    async function buy (sgaToken, amount) {return await sgaToken.exchange({value:           amount,  from: wallet});}
    async function sell(sgaToken, amount) {return await sgaToken.transfer(sgaToken.address, amount, {from: wallet});}
    async function exec(sgnToken, amount) {return await sgnToken.transfer(sgnToken.address, amount, {from: wallet});}

    async function assertMinting(mintManager, sgnToken, sgaToken, SGA_MINTED_FOR_SGN_HOLDERS, minting) {
        const minting_index   = await getMintIndex(mintManager);
        const minting_sgn     = await sgnToken.balanceOf(wallet);
        const minting_sga     = await sgaToken.balanceOf(SGA_MINTED_FOR_SGN_HOLDERS);
        const expectedMinting = `sgn: ${toFixed(minting.sgn)}, sga: ${toFixed(minting.sga)}, index: ${minting.index}`;
        const actualMinting   = `sgn: ${toFixed(minting_sgn)}, sga: ${toFixed(minting_sga)}, index: ${minting_index}`;
        assert(actualMinting == expectedMinting, `expectedMinting = ${expectedMinting}, actualMinting = ${actualMinting}`);
    }

    async function getMintIndex(mintManager) {
        try {
            while (await mintManager.isMintingStateOutdated()){
            await mintManager.updateMintingState({from: wallet});
            }

        }
        catch (error) {
            assert(error.message == "VM Exception while processing transaction: revert", error.message);
        }
        return await mintManager.getIndex();
    }

    function toFixed(x) {return web3.toBigNumber(x).toFixed();}
});
