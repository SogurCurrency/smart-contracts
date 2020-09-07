contract("SGRTokenFuncTest", function(accounts) {
    const owner  = accounts[0];
    const admin  = accounts[1];
    const wallet = accounts[2];

    const DIR    = "test/sogur/helpers/sequences";
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
        let sgrAuthorizationManager;
        let ethConverter;
        let rateApprover;
        let transactionLimiter;
        let transactionManager;
        let buyWalletsTradingDataSource;
        let sellWalletsTradingDataSource;
        let sgrTokenManager;
        let sgrBuyWalletsTradingLimiter;
        let sgrSellWalletsTradingLimiter;
        let reserveManager;
        let paymentManager;
        let paymentQueue;
        let monetaryModel;
        let aggregatorInterfaceMockup;
        before(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxy").new();
            aggregatorInterfaceMockup        = await artifacts.require("AggregatorInterfaceMockup"       ).new();
            redButton                   = await artifacts.require("RedButton"                  ).new();
            modelDataSource             = await artifacts.require("ModelDataSource"            ).new();
            modelCalculator             = await artifacts.require("ModelCalculator"            ).new();
            priceBandCalculator            = await artifacts.require("PriceBandCalculator"           ).new();
            tradingClasses              = await artifacts.require("TradingClasses"             ).new();
            walletsTradingLimiterValueConverter                = await artifacts.require("WalletsTradingLimiterValueConverter"               ).new();
            reconciliationAdjuster           = await artifacts.require("ReconciliationAdjuster"          ).new();
            authorizationDataSource     = await artifacts.require("AuthorizationDataSource"    ).new();
            sgrAuthorizationManager     = await artifacts.require("SGRAuthorizationManager"    ).new(contractAddressLocatorProxy.address);
            ethConverter        = await artifacts.require("ETHConverter"       ).new(contractAddressLocatorProxy.address);
            rateApprover          = await artifacts.require("OracleRateApprover"         ).new(contractAddressLocatorProxy.address, aggregatorInterfaceMockup.address, 10000);
            transactionLimiter          = await artifacts.require("TransactionLimiter"         ).new(contractAddressLocatorProxy.address);
            transactionManager          = await artifacts.require("TransactionManager"         ).new(contractAddressLocatorProxy.address);
            buyWalletsTradingDataSource           = await artifacts.require("WalletsTradingDataSource"          ).new(contractAddressLocatorProxy.address);
            sellWalletsTradingDataSource           = await artifacts.require("WalletsTradingDataSource"          ).new(contractAddressLocatorProxy.address);
            sgrTokenManager             = await artifacts.require("SGRTokenManager"            ).new(contractAddressLocatorProxy.address);
            sgrBuyWalletsTradingLimiter              = await artifacts.require("SGRBuyWalletsTradingLimiter"                   ).new(contractAddressLocatorProxy.address);
            sgrSellWalletsTradingLimiter              = await artifacts.require("SGRSellWalletsTradingLimiter"                   ).new(contractAddressLocatorProxy.address);
            reserveManager              = await artifacts.require("ReserveManager"             ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                ).new(contractAddressLocatorProxy.address);
            paymentQueue                   = await artifacts.require("PaymentQueue"                  ).new(contractAddressLocatorProxy.address);
            monetaryModel                   = await artifacts.require("MonetaryModel"                  ).new(contractAddressLocatorProxy.address);

            await require("./helpers/ModelDataSource.js").initialize(modelDataSource);

            await authorizationDataSource.accept(admin, {from: owner});
            await walletsTradingLimiterValueConverter.accept(owner);

            await ethConverter.accept(owner);
            await authorizationDataSource.upsertOne(wallet, Date.now(), true, -1, -1, -1, 0, {from: admin});

            await buyWalletsTradingDataSource.setAuthorizedExecutorsIdentifier(["BuyWalletsTLSGRTokenManager"], {from: owner});
            await sellWalletsTradingDataSource.setAuthorizedExecutorsIdentifier(["SellWalletsTLSGRTokenManager"], {from: owner});

        });
        for (let m = 0; m < files.length; m++) {
            describe(`file ${files[m]}:`, function() {
                const file = require("../../" + DIR + "/" + files[m]);
                let mintingPointTimersManager;
                let mintManager;
                let intervalIterator;
                let monetaryModelState;
                let sgrToken;
                let contractAddressLocator;
                before(async function() {
                    mintingPointTimersManager            = await artifacts.require("MintingPointTimersManagerExposure"   ).new(contractAddressLocatorProxy.address, file.timeout);
                    mintManager            = await artifacts.require("MintManager"           ).new(contractAddressLocatorProxy.address);
                    intervalIterator       = await artifacts.require("IntervalIterator"      ).new(contractAddressLocatorProxy.address);
                    monetaryModelState         = await artifacts.require("MonetaryModelState"        ).new(contractAddressLocatorProxy.address);
                    sgrToken               = await artifacts.require("SGRToken"              ).new(contractAddressLocatorProxy.address);
                    contractAddressLocator = await artifacts.require("ContractAddressLocator").new(...unzip([
                        ["IRedButton"              , redButton              .address],
                        ["IModelDataSource"             , modelDataSource             .address],
                        ["IModelCalculator"        , modelCalculator        .address],
                        ["IPriceBandCalculator"       , priceBandCalculator       .address],
                        ["ITradingClasses"         , tradingClasses         .address],
                        ["IWalletsTLValueConverter"           , walletsTradingLimiterValueConverter           .address],
                        ["IReconciliationAdjuster"      , reconciliationAdjuster      .address],
                        ["IAuthorizationDataSource", authorizationDataSource.address],
                        ["ISGRAuthorizationManager", sgrAuthorizationManager.address],
                        ["IETHConverter"   , ethConverter   .address],
                        ["ITransactionLimiter"     , transactionLimiter     .address],
                        ["ITransactionManager"     , transactionManager     .address],
                        ["BuyWalletsTradingDataSource"      , buyWalletsTradingDataSource      .address],
                        ["SellWalletsTradingDataSource"      , sellWalletsTradingDataSource      .address],
                        ["ISGRTokenManager"        , sgrTokenManager        .address],
                        ["BuyWalletsTLSGRTokenManager"         , sgrBuyWalletsTradingLimiter         .address],
                        ["SellWalletsTLSGRTokenManager"         , sgrSellWalletsTradingLimiter         .address],
                        ["IReserveManager"         , reserveManager         .address],
                        ["IPaymentManager"            , paymentManager            .address],
                        ["IPaymentQueue"              , paymentQueue              .address],
                        ["IMonetaryModel"              , monetaryModel              .address],
                        ["IMintingPointTimersManager"            , mintingPointTimersManager            .address],
                        ["IMintManager"            , mintManager            .address],
                        ["IIntervalIterator"       , intervalIterator       .address],
                        ["IMonetaryModelState"         , monetaryModelState         .address],
                        ["ISGRToken"               , sgrToken               .address],
                        ["IPaymentHandler"            , sgrToken               .address],
                        ["IMintListener"           , sgrToken               .address],
                        ["IRateApprover"           , rateApprover               .address],
                    ]));
                    await contractAddressLocatorProxy.upgrade(contractAddressLocator.address);

                    await aggregatorInterfaceMockup.setLatestAnswer(100000000);

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
                        const response = await eval(func)(sgrToken, input);
                        const decoded = decode(response, sgrTokenManager, 0, params);
                        const actual = web3.toBigNumber(decoded.output);
                        assert(actual.equals(output), `${func}(${input.toFixed()}) = ${actual.toFixed()}`);
                    });
                }
            });
        }
    });

    async function buy (sgrToken, amount) {return await sgrToken.exchange({value:           amount,  from: wallet});}
    async function sell(sgrToken, amount) {return await sgrToken.transfer(sgrToken.address, amount, {from: wallet});}
});
