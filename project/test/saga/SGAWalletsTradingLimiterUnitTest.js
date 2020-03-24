contract("SGAWalletsTradingLimiterUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let authorizationDataSource;
    let walletsTradingDataSource;
    let walletsTradingLimiterValueConverter;
    let tradingClasses;
    let sgaWalletsTradingLimiter;

    const VALUE  = 1000;
    const owner  = accounts[0];
    const nonOwner  = accounts[1];
    const wallet = accounts[1];

    const updateWalletAllowedIdentifier = "ISGATokenManager";

    const catchRevert = require("../exceptions.js").catchRevert;

    const tradeClassId  = 0;


    var testingValues = [
     {
        "side" : "buy",
        "testedLimiter": "SGABuyWalletsTradingLimiter",
        "dataSourceIdentifier": "BuyWalletsTradingDataSource"
     },
     {
        "side" : "sell",
        "testedLimiter": "SGASellWalletsTradingLimiter",
        "dataSourceIdentifier": "SellWalletsTradingDataSource"
     }
     ];

     for (let j = 0; j < testingValues.length; j++) {
        let side = testingValues[j].side;
        let testedLimiter = testingValues[j].testedLimiter;
        let dataSourceIdentifier = testingValues[j].dataSourceIdentifier;

        describe(`testing values testedLimiter ${testedLimiter} dataSourceIdentifier ${dataSourceIdentifier}`,  function() {
           beforeEach(async function() {
           await rebuild(testedLimiter, dataSourceIdentifier);
           });

        describe("function getWalletsTradingDataSourceIdentifier:", function() {
           it("should return the right data source identifier", async function() {
              if (testedLimiter == "SGABuyWalletsTradingLimiter")
                assert.equal("BuyWalletsTradingDataSource", web3.toUtf8(await sgaWalletsTradingLimiter.walletsTradingDataSourceIdentifier.call()));
              else
                assert.equal("SellWalletsTradingDataSource", web3.toUtf8(await sgaWalletsTradingLimiter.walletsTradingDataSourceIdentifier.call()));
           });
        });

        describe("function getOverrideTradeLimitAndClass:", function() {
           it("should return the authorizationDataSource getSellTradeLimitAndClass value", async function() {
              await setAuthorizationDataSourceWalletLimit(wallet, 50, tradeClassId, side);
              var [actualLimit, _] = await sgaWalletsTradingLimiter.getOverrideTradeLimitAndClass(wallet);
              assert.equal(actualLimit , 50);
           });
        });

        describe("function getTradeLimit:", function() {
           it("should return the trading classes value", async function() {
              let limit = 222;
              let tradeClassId = 12;
              await setTradingClasses(tradeClassId, limit, side);

              var actualLimit = await sgaWalletsTradingLimiter.getTradeLimit(tradeClassId);
              assert.equal(actualLimit , limit);
           });
        });

        describe("function updateWallet:", function() {
           it("function updateWallet should abort with an error if called by a non-user", async function() {
               await catchRevert(sgaWalletsTradingLimiter.updateWallet(wallet, VALUE, {from: nonOwner}));
           });

           it("function updateWallet should complete successfully when the buy-limit is zero", async function() {
               await setAuthorizationDataSourceWalletLimit(wallet, 0, tradeClassId, side);
               await sgaWalletsTradingLimiter.updateWallet(wallet, VALUE);
           });

           it("function updateWallet should complete successfully when the trade-limit is not zero", async function() {
               await setAuthorizationDataSourceWalletLimit(wallet, 1, tradeClassId, side)
               await sgaWalletsTradingLimiter.updateWallet(wallet, VALUE);
           });

           var limitValues = [
            {
               'defaultLimit': 2,
               'overrideLimit': 3,
               'expectedLimit': 3,
            },
            {
               'defaultLimit': 2,
               'overrideLimit': 0,
               'expectedLimit': 2,
            },
            {
               'defaultLimit': 0,
               'overrideLimit': 1,
               'expectedLimit': 1,
            },
            {
               'defaultLimit': 0,
               'overrideLimit': 0,
               'expectedLimit': 0
            }
         ];

           for (let j = 0; j < limitValues.length; j++) {
               it(`cap values defaultLimit ${limitValues[j].defaultLimit} overrideLimit ${limitValues[j].overrideLimit}`, async function() {
                  const defaultLimit = limitValues[j].defaultLimit;
                  const overrideLimit = limitValues[j].overrideLimit;
                  const expectedLimit = limitValues[j].expectedLimit;

                  await setAuthorizationDataSourceWalletLimit(wallet, overrideLimit, tradeClassId, side)
                  await setTradingClasses(tradeClassId, defaultLimit, side);

                  await sgaWalletsTradingLimiter.updateWallet(wallet, VALUE);

                  var [, actualLimit] = await walletsTradingDataSource.getCalledValues();

                  assert.equal(expectedLimit , actualLimit);
               });
           }
        });

        describe("function getUpdateWalletPermittedContractLocatorIdentifier:", function() {
           it("should return updateWalletAllowedIdentifier", async function() {

            assert.equal(updateWalletAllowedIdentifier, web3.toUtf8(await sgaWalletsTradingLimiter.getUpdateWalletPermittedContractLocatorIdentifier()));
           });
        });

        describe("function getLimiterValue:", function() {
           it("should convert the input SGA amount to limiter amount", async function() {
               assert.equal(await sgaWalletsTradingLimiter.getLimiterValue(VALUE) , VALUE);
               await walletsTradingLimiterValueConverter.setRatio(2);
               assert.equal(await sgaWalletsTradingLimiter.getLimiterValue(VALUE) ,  2*VALUE);
           });
        });
 });
}


 async function setTradingClasses(tradeClassId, limit, side) {
     if (side == "buy")
       await tradingClasses.set(tradeClassId, 0, limit, 0);
     else if (side == "sell")
       await tradingClasses.set(tradeClassId, 0, 0, limit);
 }

 async function setAuthorizationDataSourceWalletLimit(wallet, limit, tradeClassId, side) {
     if (side == "buy")
       await authorizationDataSource.set(wallet, false, 0, limit, 0, tradeClassId);
     else if (side == "sell")
       await authorizationDataSource.set(wallet, false, 0, 0, limit, tradeClassId);
 }

 async function rebuild(testedLimiter, dataSourceIdentifier) {
     contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
     authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
     walletsTradingDataSource           = await artifacts.require("WalletsTradingDataSourceMockup"          ).new();
     walletsTradingLimiterValueConverter            = await artifacts.require("WalletsTradingLimiterValueConverterMockup"           ).new();
     tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
     sgaWalletsTradingLimiter              = await artifacts.require(testedLimiter                   ).new(contractAddressLocatorProxy.address);

     await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
     await contractAddressLocatorProxy.set(dataSourceIdentifier      , walletsTradingDataSource      .address);
     await contractAddressLocatorProxy.set("IWalletsTLValueConverter"       , walletsTradingLimiterValueConverter       .address);
     await contractAddressLocatorProxy.set("ITradingClasses"         , tradingClasses         .address);

     await contractAddressLocatorProxy.set(updateWalletAllowedIdentifier, owner);
     await walletsTradingLimiterValueConverter.setRatio(1);
    }
});
