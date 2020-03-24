contract("ShareHolderTest", function(accounts) {
    const owner = accounts[0];

    const params = [
        {name: "user"  , size: 160, indexed: true },
        {name: "input" , size: 256, indexed: false},
        {name: "output", size: 256, indexed: false},
    ];

    const unzip      = require("../utilities.js").unzip;
    const decode     = require("../utilities.js").decode;
    const initialize = require("./helpers/ModelDataSource.js").initialize;
    const sequence   = require("./helpers/ShareHolderTestSequence.js");

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
        let buyWalletsTradingDataSource;
        let sellWalletsTradingDataSource;
        let sgaBuyWalletsTradingLimiter;
        let sgaSellWalletsTradingLimiter;
        let sgnTokenManager;
        let sgaTokenManager;
        let reserveManager;
        let paymentManager;
        let paymentQueue;
        let monetaryModel;
        let mintingPointTimersManager;
        let mintManager;
        let intervalIterator;
        let monetaryModelState;
        let sgaToken;
        let sgnToken;
        let contractAddressLocator;
        let decimals;
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
            sgnTokenManager             = await artifacts.require("SGNTokenManager"            ).new(contractAddressLocatorProxy.address);
            sgaTokenManager             = await artifacts.require("SGATokenManager"            ).new(contractAddressLocatorProxy.address);
            buyWalletsTradingDataSource             = await artifacts.require("WalletsTradingDataSource"            ).new(contractAddressLocatorProxy.address);
            sellWalletsTradingDataSource             = await artifacts.require("WalletsTradingDataSource"            ).new(contractAddressLocatorProxy.address);
            sgaBuyWalletsTradingLimiter             = await artifacts.require("SGABuyWalletsTradingLimiter"            ).new(contractAddressLocatorProxy.address);
            sgaSellWalletsTradingLimiter             = await artifacts.require("SGASellWalletsTradingLimiter"            ).new(contractAddressLocatorProxy.address);
            reserveManager              = await artifacts.require("ReserveManager"             ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                ).new(contractAddressLocatorProxy.address);
            paymentQueue                   = await artifacts.require("PaymentQueue"                  ).new(contractAddressLocatorProxy.address);
            monetaryModel                   = await artifacts.require("MonetaryModel"                  ).new(contractAddressLocatorProxy.address);
            mintingPointTimersManager                 = await artifacts.require("MintingPointTimersManagerExposure"        ).new(contractAddressLocatorProxy.address, 0);
            mintManager                 = await artifacts.require("MintManager"                ).new(contractAddressLocatorProxy.address);
            intervalIterator            = await artifacts.require("IntervalIterator"           ).new(contractAddressLocatorProxy.address);
            monetaryModelState              = await artifacts.require("MonetaryModelState"             ).new(contractAddressLocatorProxy.address);
            sgaToken                    = await artifacts.require("SGAToken"                   ).new(contractAddressLocatorProxy.address);
            sgnToken                    = await artifacts.require("SGNToken"                   ).new(contractAddressLocatorProxy.address, owner);
            contractAddressLocator      = await artifacts.require("ContractAddressLocator"     ).new(...unzip([
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
                ['BuyWalletsTradingDataSource'      ,buyWalletsTradingDataSource      .address],
                ['SellWalletsTradingDataSource'      ,sellWalletsTradingDataSource      .address],
                ["BuyWalletsTLSGATokenManager"         , sgaBuyWalletsTradingLimiter         .address],
                ["SellWalletsTLSGATokenManager"         , sgaSellWalletsTradingLimiter         .address],
                ["ISGNTokenManager"        , sgnTokenManager        .address],
                ["ISGATokenManager"        , sgaTokenManager        .address],
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
            await initialize(modelDataSource);
            await authorizationDataSource.accept(owner);
            await buyWalletsTradingDataSource.setAuthorizedExecutorsIdentifier(["BuyWalletsTLSGATokenManager"],{from: owner});
            await sellWalletsTradingDataSource.setAuthorizedExecutorsIdentifier(["SellWalletsTLSGATokenManager"],{from: owner});
            await walletsTradingLimiterValueConverter.accept(owner);
            await ethConverter.accept(owner);
            await authorizationDataSource.upsertOne(owner, Date.now(), true, -1, -1, -1, 0);
            decimals = await sgnToken.decimals();
            await rateApprover.setRateBounds(1, "0x10000000000000000", 1, 1, "0x10000000000000000",{from: owner});
            await walletsTradingLimiterValueConverter.setPrice(1,1,1,{from: owner});
            await ethConverter.setPrice(1,1,1,1,1,{from: owner});
            await reconciliationAdjuster.setFactor(1,1,1,{from: owner});
        });
        for (let n = 0; n < sequence.length; n++) {
            it(`test ${n}`, async function() {
                // 1 SDR equals 1 ETH
                const sdr_worth  = web3.toBigNumber(sequence[n].sdr_worth  + `e${decimals}`);
                const sgn_input  = web3.toBigNumber(sequence[n].sgn_input  + `e${decimals}`);
                const sdr_output = web3.toBigNumber(sequence[n].sdr_output + `e${decimals}`);
                const mint_index = web3.toBigNumber(sequence[n].mint_index);
                // exchange ETH for SGA
                const sdrWorth  = await web3.eth.getBalance(sgaToken.address);
                const response1 = await sgaToken.exchange({value: sdr_worth.minus(sdrWorth)});
                // update the system
                const response2 = await mintingPointTimersManager.jump(1);
                const mintIndex = await getMintIndex(mintManager);
                // exchange SGN for SGA
                const response3 = await sgnToken.transfer(sgnToken.address, sgn_input);
                const sgnEvent  = decode(response3, sgnTokenManager, 0, params);
                const sgaAmount = web3.toBigNumber(sgnEvent.output);
                // exchange SGA for ETH
                const response4 = await sgaToken.transfer(sgaToken.address, sgaAmount);
                const sgaEvent  = decode(response4, sgaTokenManager, 0, params);
                const sdrAmount = web3.toBigNumber(sgaEvent.output);
                // verify the results
                const expected = `amount: ${sdr_output.toFixed()}, index: ${mint_index}`;
                const actual   = `amount: ${sdrAmount .toFixed()}, index: ${mintIndex }`;
                assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
            });
        }
    });

    async function getMintIndex(mintManager) {
        try {
            while (await mintManager.isMintingStateOutdated())
                await mintManager.updateMintingState();
        }
        catch (error) {
            assert(error.message == "VM Exception while processing transaction: revert", error.message);
        }
        return await mintManager.getIndex();
    }
});
