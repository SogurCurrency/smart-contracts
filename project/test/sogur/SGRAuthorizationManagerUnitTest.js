contract("SGRAuthorizationManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let authorizationDataSource;
    let sgrAuthorizationManager;
    let tradingClasses;

    const testedWallet1  = accounts[5];
    const testedWallet2  = accounts[6];
    const testedWallet3  = accounts[7];


    const Flag = require("../authorization/helpers/AuthorizationActionRoles.js").Flag;
    const test = require("../authorization/helpers/AuthorizationActionRoles.js").test;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
        tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
        sgrAuthorizationManager     = await artifacts.require("SGRAuthorizationManager"          ).new(contractAddressLocatorProxy.address);
    });

    describe("function isAuthorizedForPublicOperation:", function() {

        beforeEach(async function() {
           contractAddressauthorizationDataSourceLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
           authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
           tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
           sgrAuthorizationManager     = await artifacts.require("SGRAuthorizationManager"          ).new(contractAddressLocatorProxy.address);

           await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
           await contractAddressLocatorProxy.set("ITradingClasses"         , tradingClasses         .address);
        });
        it("should return true if is authorized true", async function() {
           await authorizationDataSource.set(testedWallet1, true, 2, 0, 0, 0);
           assert.equal(await sgrAuthorizationManager.isAuthorizedForPublicOperation(testedWallet1), true);
        });
        it("should return false if is authorized false", async function() {
           await authorizationDataSource.set(testedWallet1, false, 2, 0, 0, 0);
           assert.equal(await sgrAuthorizationManager.isAuthorizedForPublicOperation(testedWallet1), false);
        });
    });


    describe("functionality assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
        });
        test(set, accounts, isAuthorizedToBuy         , [Flag.BuySgr                                            ]);
        test(set, accounts, isAuthorizedToSell        , [Flag.SellSgr                                           ]);
    });


    describe("override functionality assertion:", function() {

        beforeEach(async function() {
            contractAddressauthorizationDataSourceLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
            tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
            sgrAuthorizationManager     = await artifacts.require("SGRAuthorizationManager"          ).new(contractAddressLocatorProxy.address);

            await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
            await contractAddressLocatorProxy.set("ITradingClasses"         , tradingClasses         .address);
        });

        const tradeClassId = 1;
        const skippedActionRole = 0;
        const invalidActionRole = 400;

        var authorizationValues = [
            {
                'validActionRole': 1,
                'shouldPass' : ["isAuthorizedToBuy"]
            },
            {
                'validActionRole': 2,
                'shouldPass' : ["isAuthorizedToSell"]
            }
        ];

        for (let j = 0; j < authorizationValues.length; j++) {

            const actionRole = authorizationValues[j].validActionRole;
            const shouldPass = authorizationValues[j].shouldPass;

            it(`check return overridden value with undefined authorizationDataSourceActionRole`, async function() {
                await setAuthorizationDataSourceWalletLimit(testedWallet1, true, skippedActionRole, tradeClassId);
                await setTradingClasses(tradeClassId, actionRole);

                assert.equal(await sgrAuthorizationManager.isAuthorizedToBuy(testedWallet1), shouldPass.includes("isAuthorizedToBuy"));
                assert.equal(await sgrAuthorizationManager.isAuthorizedToSell(testedWallet1),shouldPass.includes("isAuthorizedToSell"));

                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransfer(testedWallet1, testedWallet2), true);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransferFrom(testedWallet1, testedWallet2, testedWallet3), true);
            });

            it(`check return overridden value with defined authorizationDataSourceActionRole`, async function() {
                await setAuthorizationDataSourceWalletLimit(testedWallet1, true, actionRole, tradeClassId);
                await setTradingClasses(tradeClassId, invalidActionRole );

                assert.equal(await sgrAuthorizationManager.isAuthorizedToBuy(testedWallet1), shouldPass.includes("isAuthorizedToBuy"));
                assert.equal(await sgrAuthorizationManager.isAuthorizedToSell(testedWallet1),shouldPass.includes("isAuthorizedToSell"));

                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransfer(testedWallet1, testedWallet2), true);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransferFrom(testedWallet1, testedWallet2, testedWallet3), true);
            });

            it(`check return false with invalid action role`, async function() {
                await setAuthorizationDataSourceWalletLimit(testedWallet1, true, invalidActionRole, tradeClassId);

                assert.equal(await sgrAuthorizationManager.isAuthorizedToBuy(testedWallet1), false);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToSell(testedWallet1),false);

                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransfer(testedWallet1, testedWallet2), true);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransferFrom(testedWallet1, testedWallet2, testedWallet3), true);
            });

            it(`check return false with override invalid action role`, async function() {
                await setAuthorizationDataSourceWalletLimit(testedWallet1, true, skippedActionRole, tradeClassId);
                await setTradingClasses(tradeClassId, invalidActionRole );

                assert.equal(await sgrAuthorizationManager.isAuthorizedToBuy(testedWallet1), false);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToSell(testedWallet1),false);

                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransfer(testedWallet1, testedWallet2), true);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransferFrom(testedWallet1, testedWallet2, testedWallet3), true);
            });

            it(`check return false with missing action role`, async function() {
                await setAuthorizationDataSourceWalletLimit(testedWallet1, true, 0, tradeClassId);
                await setTradingClasses(tradeClassId, 0 );

                assert.equal(await sgrAuthorizationManager.isAuthorizedToBuy(testedWallet1), false);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToSell(testedWallet1),false);

                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransfer(testedWallet1, testedWallet2), true);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransferFrom(testedWallet1, testedWallet2, testedWallet3), true);
            });

            it(`check return false with is whitelisted false`, async function() {
                await setAuthorizationDataSourceWalletLimit(testedWallet1, false, actionRole, tradeClassId);
                await setTradingClasses(tradeClassId, actionRole );

                assert.equal(await sgrAuthorizationManager.isAuthorizedToBuy(testedWallet1), false);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToSell(testedWallet1),false);

                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransfer(testedWallet1, testedWallet2), true);
                assert.equal(await sgrAuthorizationManager.isAuthorizedToTransferFrom(testedWallet1, testedWallet2, testedWallet3), true);
            });

        }

        });


    async function set                       (...args) {return await authorizationDataSource.set                       (...args);}
    async function isAuthorizedToBuy         (...args) {return await sgrAuthorizationManager.isAuthorizedToBuy         (...args);}
    async function isAuthorizedToSell        (...args) {return await sgrAuthorizationManager.isAuthorizedToSell        (...args);}

    async function setTradingClasses(tradeClassId, actionRole) {
        await tradingClasses.set(tradeClassId, actionRole, 0, 0);
    }

    async function setAuthorizationDataSourceWalletLimit(wallet, isWhitelisted, actionRole, tradeClassId) {
        await authorizationDataSource.set(wallet, isWhitelisted, actionRole, 0, 0, tradeClassId);
    }
});
