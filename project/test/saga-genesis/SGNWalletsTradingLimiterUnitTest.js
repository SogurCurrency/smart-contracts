contract("SGNWalletsTradingLimiterUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let authorizationDataSource;
    let walletsTradingDataSource;
    let walletsTradingLimiterValueConverter;
    let tradingClasses;
    let sgnWalletsTradingLimiter;
    let sgnConversionManager;
    let mintManager;

    let MAX_RESOLUTION;
    let ILLEGAL_VAL;

    const SEQUENCE_NUM = 1000;
    const SGN_MIN_LIMITER_VALUE_N     = 2000;
    const SGN_MIN_LIMITER_VALUE_D     = 3000;
    const SGN_AMOUNT  = 1000;
    
    const owner  = accounts[0];
    const nonOwner  = accounts[1];
    const wallet = accounts[1];

    const updateWalletAllowedIdentifier = "ISGNTokenManager";

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    beforeEach(async function() {
       await rebuild();

    });

    describe("function updateWallet:", function() {
        beforeEach(async function() {
           await contractAddressLocatorProxy.set(updateWalletAllowedIdentifier, owner);
           await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, 1, 1);
        });

        it("should abort with an error if called not from SGNTokenManager", async function() {
            await catchRevert(sgnWalletsTradingLimiter.updateWallet(wallet, SGN_AMOUNT, {from: nonOwner}));
        });
        it("should complete successfully when the trade-limit is zero", async function() {
            await authorizationDataSource.set(wallet, false, 0, 0, 0);
            await sgnWalletsTradingLimiter.updateWallet(wallet, SGN_AMOUNT);
        });
        it("should complete successfully when the trade-limit is not zero", async function() {
            await authorizationDataSource.set(wallet, false, 0, 1, 0);
            await sgnWalletsTradingLimiter.updateWallet(wallet, SGN_AMOUNT);
        });
    });

    describe("function setSGNMinimumLimiterValue:", function() {
        it("should abort with an error if called by a non-owner", async function() {
          await catchRevert(sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, SGN_MIN_LIMITER_VALUE_N, SGN_MIN_LIMITER_VALUE_D, {from: nonOwner}));
        });
        it("should abort with an error if any input value is out of range", async function() {
          await catchRevert(sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, 0          , SGN_MIN_LIMITER_VALUE_D   ));
          await catchRevert(sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, ILLEGAL_VAL, SGN_MIN_LIMITER_VALUE_D   ));
          await catchRevert(sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, SGN_MIN_LIMITER_VALUE_N   , 0          ));
          await catchRevert(sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, SGN_MIN_LIMITER_VALUE_N   , ILLEGAL_VAL));
        });
        it("should complete successfully if all input values are within range", async function() {
          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, SGN_MIN_LIMITER_VALUE_N + 0, SGN_MIN_LIMITER_VALUE_D + 0);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueN(), SGN_MIN_LIMITER_VALUE_N + 0);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueD(), SGN_MIN_LIMITER_VALUE_D + 0);
        });

        it("should save sequenceNum after setting new minimum value", async function() {
          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, 2, 2);
          await assertEqual(sgnWalletsTradingLimiter.sequenceNum(), SEQUENCE_NUM);

          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM + 1, 2, 2);
          await assertEqual(sgnWalletsTradingLimiter.sequenceNum(), SEQUENCE_NUM + 1);

          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM + 20, 2, 2);
          await assertEqual(sgnWalletsTradingLimiter.sequenceNum(), SEQUENCE_NUM + 20);
        });

        it("should not set minimum value if sequenceNum is lower or equal to saved", async function() {
          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, 2, 2);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueN(), 2);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueD(), 2);

          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, 3, 3);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueN(), 2);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueD(), 2);

          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM - 1, 4, 4);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueN(), 2);
          await assertEqual(sgnWalletsTradingLimiter.sgnMinimumLimiterValueD(), 2);
        });

        it("should publish SGNMinimumLimiterValueSaved event if sequence num is valid", async function() {
          const response = await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(1, 2, 4);
          assert.equal(response.logs[0].event, "SGNMinimumLimiterValueSaved");
          assert.equal(response.logs[0].args._sgnMinimumLimiterValueN , 2);
          assert.equal(response.logs[0].args._sgnMinimumLimiterValueD ,4);
        });

        it("should publish SGNMinimumLimiterValueNotSaved event if sequence num is not valid", async function() {
          await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(1, 2, 4);
          const response = await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(1, 2, 4);
          assert.equal(response.logs[0].event, "SGNMinimumLimiterValueNotSaved");
          assert.equal(response.logs[0].args._sgnMinimumLimiterValueN , 2);
          assert.equal(response.logs[0].args._sgnMinimumLimiterValueD ,4);
        });
    });

    describe("function calcSGNMinimumLimiterValue:", function() {
        it("should abort with an error if called before setting SGNMinimumLimiterValue", async function() {
          await catchInvalidOpcode(sgnWalletsTradingLimiter.calcSGNMinimumLimiterValue(SGN_AMOUNT));
        });

        for (let factorN = 1; factorN <= 10; factorN++) {
          for (let factorD = 1; factorD <= 10; factorD++) {
            it(`factorN = ${factorN}, factorD = ${factorD}`, async function() {
              await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(Date.now(), factorN, factorD);
              await assertEqual(await sgnWalletsTradingLimiter.calcSGNMinimumLimiterValue(SGN_AMOUNT) , calcSGNMinimumLimiterValue(SGN_AMOUNT, factorN, factorD));
            });
          }
        }
    });


    describe("function getLimiterValue:", function() {
        it("should use min value if sgn price is less then sgn min value", async function() {
            const sgnAmount = 1000;
            const sgnMinValueN = 8
            const sgnMinValueD = 2
            const sgnPrice = 3;

            //sgn amount * sgn price -- converted to limiter value (*1)
            // (1000 * 3)*1
            // sgn min value is 8/2
            // ( 1000 *8 ) /2
            await sgnConversionManager.setRatio(sgnPrice);
            await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, sgnMinValueN, sgnMinValueD);

            assert.equal(await sgnWalletsTradingLimiter.getLimiterValue(sgnAmount),  (sgnMinValueN/sgnMinValueD) * sgnAmount);
        });
        it("should not use min value if sgn price is equal to min value", async function() {
            let sgnAmount = 1000;
            const sgnMinValueN = 8
            const sgnMinValueD = 2
            let sgnPrice = 4;

            await sgnConversionManager.setRatio(sgnPrice);
            await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, sgnMinValueN, sgnMinValueD);

            assert.equal(await sgnWalletsTradingLimiter.getLimiterValue(sgnAmount),  sgnPrice * sgnAmount);
        });
        it("should not use min value if sgn price is greater then min value", async function() {
            let sgnAmount = 1000;
            const sgnMinValueN = 8
            const sgnMinValueD = 2
            let sgnPrice = 5;

            await sgnConversionManager.setRatio(sgnPrice);
            await sgnWalletsTradingLimiter.setSGNMinimumLimiterValue(SEQUENCE_NUM, sgnMinValueN, sgnMinValueD);

            assert.equal(await sgnWalletsTradingLimiter.getLimiterValue(sgnAmount),  sgnPrice * sgnAmount);
        });
    });


    function calcSGNMinimumLimiterValue(sgnAmount, factorN, factorD) {return Math.floor(sgnAmount * factorN / factorD);}


    async function rebuild() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
        walletsTradingDataSource           = await artifacts.require("WalletsTradingDataSourceMockup"          ).new();
        walletsTradingLimiterValueConverter            = await artifacts.require("WalletsTradingLimiterValueConverterMockup"           ).new();
        tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
        sgnWalletsTradingLimiter              = await artifacts.require("SGNWalletsTradingLimiter"                   ).new(contractAddressLocatorProxy.address);
        sgnConversionManager           = await artifacts.require("SGNConversionManagerMockup"          ).new();
        mintManager                 = await artifacts.require("MintManagerMockup"                ).new();

        await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
        await contractAddressLocatorProxy.set("IWalletsTradingDataSource"      , walletsTradingDataSource      .address);
        await contractAddressLocatorProxy.set("IWalletsTLValueConverter"       , walletsTradingLimiterValueConverter       .address);
        await contractAddressLocatorProxy.set("ITradingClasses"         , tradingClasses         .address);

        await contractAddressLocatorProxy.set("ISGNConversionManager"         , sgnConversionManager         .address);
        await contractAddressLocatorProxy.set("IMintManager"         , mintManager         .address);

        await walletsTradingLimiterValueConverter.setRatio(1);
        MAX_RESOLUTION    = await sgnWalletsTradingLimiter.MAX_RESOLUTION();
        ILLEGAL_VAL       = MAX_RESOLUTION.plus(1);
    }

});
