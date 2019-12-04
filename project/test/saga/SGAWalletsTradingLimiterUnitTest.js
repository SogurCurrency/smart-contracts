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

    beforeEach(async function() {
       await rebuild();

    });

    describe("function updateWallet:", function() {
       it("function updateWallet should abort with an error if called by a non-user", async function() {
           await catchRevert(sgaWalletsTradingLimiter.updateWallet(wallet, VALUE, {from: nonOwner}));
       });
       it("function updateWallet should complete successfully when the trade-limit is zero", async function() {
           await authorizationDataSource.set(wallet, false, 0, 0, 0);
           await sgaWalletsTradingLimiter.updateWallet(wallet, VALUE);
       });
       it("function updateWallet should complete successfully when the trade-limit is not zero", async function() {
           await authorizationDataSource.set(wallet, false, 0, 1, 0);
           await sgaWalletsTradingLimiter.updateWallet(wallet, VALUE);
       });
    });


    describe("function getUpdateWalletPermittedContractLocatorIdentifier:", function() {
       it("should return updateWalletAllowedIdentifier", async function() {
           assert(await sgaWalletsTradingLimiter.getUpdateWalletPermittedContractLocatorIdentifier(), updateWalletAllowedIdentifier);
       });
    });

    describe("function getLimiterValue:", function() {
       it("should convert the input SGA amount to limiter amount", async function() {
           assert(await sgaWalletsTradingLimiter.getLimiterValue(VALUE), VALUE);
           await walletsTradingLimiterValueConverter.setRatio(2);
           assert(await sgaWalletsTradingLimiter.getLimiterValue(VALUE), 2*VALUE);
       });
    });

    async function rebuild() {
       contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
       authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
       walletsTradingDataSource           = await artifacts.require("WalletsTradingDataSourceMockup"          ).new();
       walletsTradingLimiterValueConverter            = await artifacts.require("WalletsTradingLimiterValueConverterMockup"           ).new();
       tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
       sgaWalletsTradingLimiter              = await artifacts.require("SGAWalletsTradingLimiter"                   ).new(contractAddressLocatorProxy.address);

       await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
       await contractAddressLocatorProxy.set("IWalletsTradingDataSource"      , walletsTradingDataSource      .address);
       await contractAddressLocatorProxy.set("IWalletsTLValueConverter"       , walletsTradingLimiterValueConverter       .address);
       await contractAddressLocatorProxy.set("ITradingClasses"         , tradingClasses         .address);

       await contractAddressLocatorProxy.set(updateWalletAllowedIdentifier, owner);
       await walletsTradingLimiterValueConverter.setRatio(1);
    }
});
