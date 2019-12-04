contract("SGATokenFuncTest", function(accounts) {
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
        let authorizationDataSource;
        let sgaAuthorizationManager;
        let ethConverter;
        let rateApprover;
        let transactionLimiter;
        let transactionManager;
        let walletsTradingDataSource;
        let sgaTokenManager;
        let sgaWalletsTradingLimiter;
        let reserveManager;
        let paymentManager;
        let paymentQueue;
        let monetaryModel;
        before(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxy").new();
            redButton                   = await artifacts.require("RedButton"                  ).new();
            modelDataSource             = await artifacts.require("ModelDataSource"            ).new();
            modelCalculator             = await artifacts.require("ModelCalculator"            ).new();
            priceBandCalculator            = await artifacts.require("PriceBandCalculator"           ).new();
            tradingClasses              = await artifacts.require("TradingClasses"             ).new();
            walletsTradingLimiterValueConverter                = await artifacts.require("WalletsTradingLimiterValueConverter"               ).new();
            reconciliationAdjuster           = await artifacts.require("ReconciliationAdjuster"          ).new();
            authorizationDataSource     = await artifacts.require("AuthorizationDataSource"    ).new();
            sgaAuthorizationManager     = await artifacts.require("SGAAuthorizationManager"    ).new(contractAddressLocatorProxy.address);
            ethConverter        = await artifacts.require("ETHConverter"       ).new(contractAddressLocatorProxy.address);
            rateApprover          = await artifacts.require("RateApprover"         ).new(contractAddressLocatorProxy.address);
            transactionLimiter          = await artifacts.require("TransactionLimiter"         ).new(contractAddressLocatorProxy.address);
            transactionManager          = await artifacts.require("TransactionManager"         ).new(contractAddressLocatorProxy.address);
            walletsTradingDataSource           = await artifacts.require("WalletsTradingDataSource"          ).new(contractAddressLocatorProxy.address);
            sgaTokenManager             = await artifacts.require("SGATokenManager"            ).new(contractAddressLocatorProxy.address);
            sgaWalletsTradingLimiter              = await artifacts.require("SGAWalletsTradingLimiter"                   ).new(contractAddressLocatorProxy.address);
            reserveManager              = await artifacts.require("ReserveManager"             ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                ).new(contractAddressLocatorProxy.address);
            paymentQueue                   = await artifacts.require("PaymentQueue"                  ).new(contractAddressLocatorProxy.address);
            monetaryModel                   = await artifacts.require("MonetaryModel"                  ).new(contractAddressLocatorProxy.address);
            await require("./helpers/ModelDataSource.js").initialize(modelDataSource);

            await authorizationDataSource.accept(admin, {from: owner});
            await walletsTradingLimiterValueConverter.accept(owner);
            await ethConverter.accept(owner);
            await authorizationDataSource.upsertOne(wallet, Date.now(), true, -1, -1, 0, {from: admin});
        });
        for (let m = 0; m < files.length; m++) {
            describe(`file ${files[m]}:`, function() {
                const file = require("../../" + DIR + "/" + files[m]);
                let mintingPointTimersManager;
                let mintManager;
                let intervalIterator;
                let monetaryModelState;
                let sgaToken;
                let contractAddressLocator;
                before(async function() {
                    mintingPointTimersManager            = await artifacts.require("MintingPointTimersManagerExposure"   ).new(contractAddressLocatorProxy.address, file.timeout);
                    mintManager            = await artifacts.require("MintManager"           ).new(contractAddressLocatorProxy.address);
                    intervalIterator       = await artifacts.require("IntervalIterator"      ).new(contractAddressLocatorProxy.address);
                    monetaryModelState         = await artifacts.require("MonetaryModelState"        ).new(contractAddressLocatorProxy.address);
                    sgaToken               = await artifacts.require("SGAToken"              ).new(contractAddressLocatorProxy.address);
                    contractAddressLocator = await artifacts.require("ContractAddressLocator").new(...unzip([
                        ["IRedButton"              , redButton              .address],
                        ["IModelDataSource"             , modelDataSource             .address],
                        ["IModelCalculator"        , modelCalculator        .address],
                        ["IPriceBandCalculator"       , priceBandCalculator       .address],
                        ["ITradingClasses"         , tradingClasses         .address],
                        ["IWalletsTLValueConverter"           , walletsTradingLimiterValueConverter           .address],
                        ["IReconciliationAdjuster"      , reconciliationAdjuster      .address],
                        ["IAuthorizationDataSource", authorizationDataSource.address],
                        ["ISGAAuthorizationManager", sgaAuthorizationManager.address],
                        ["IETHConverter"   , ethConverter   .address],
                        ["ITransactionLimiter"     , transactionLimiter     .address],
                        ["ITransactionManager"     , transactionManager     .address],
                        ["IWalletsTradingDataSource"      , walletsTradingDataSource      .address],
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
                        ["IRateApprover"           , rateApprover               .address],
                    ]));
                    await contractAddressLocatorProxy.upgrade(contractAddressLocator.address);
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
                    });
                }
            });
        }
    });

    async function buy (sgaToken, amount) {return await sgaToken.exchange({value:           amount,  from: wallet});}
    async function sell(sgaToken, amount) {return await sgaToken.transfer(sgaToken.address, amount, {from: wallet});}
});
