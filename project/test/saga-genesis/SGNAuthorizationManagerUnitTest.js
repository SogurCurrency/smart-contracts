contract("SGNAuthorizationManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let authorizationDataSource;
    let sgnAuthorizationManager;
    let tradingClasses;

    const Flag = require("../authorization/helpers/AuthorizationActionRoles.js").Flag;
    const test = require("../authorization/helpers/AuthorizationActionRoles.js").test;

    const senderWallet  = accounts[5];
    const targetWallet  = accounts[6];
    const sourceWallet  = accounts[7];

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
        tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
        sgnAuthorizationManager     = await artifacts.require("SGNAuthorizationManager"          ).new(contractAddressLocatorProxy.address);
    });

    describe("functionality assertion:", function() {
        before(async function() {
           await contractAddressLocatorProxy.set("ITradingClasses"         , tradingClasses         .address);
           await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
        });
        test(set, accounts, isAuthorizedToSell        , [Flag.SellSgn                                           ]);
        test(set, accounts, isAuthorizedToTransfer    , [Flag.TransferSgn    , Flag.ReceiveSgn                  ]);
        test(set, accounts, isAuthorizedToTransferFrom, [Flag.TransferFromSgn, Flag.TransferSgn, Flag.ReceiveSgn]);
    });

    describe("override functionality assertion:", function() {
        beforeEach(async function() {
           contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
           authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
           tradingClasses              = await artifacts.require("TradingClassesMockup"             ).new();
           sgnAuthorizationManager     = await artifacts.require("SGNAuthorizationManager"          ).new(contractAddressLocatorProxy.address);

           await contractAddressLocatorProxy.set("ITradingClasses"         , tradingClasses         .address);
           await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
        });


        const skippedActionRole = 0;
        const invalidActionRole = 400;

        const senderTradeClassId = 1;
        const targetTradeClassId = 2;
        const sourceTradeClassId = 3;


        var authorizationValues = [
         {
            'senderValidActionRole': 4,
            'shouldPass' : ["isAuthorizedToSell"]
         },
         {
            'senderValidActionRole': 16,
            'targetValidActionRole': 8,
            'shouldPass' : ["isAuthorizedToTransfer"]
         },
         {
            'senderValidActionRole': 32,
            'sourceValidActionRole': 16,
            'targetValidActionRole': 8,
            'shouldPass' : ["isAuthorizedToTransferFrom"]
         }
        ];

        for (let j = 0; j < authorizationValues.length; j++) {
            const senderValidActionRole = authorizationValues[j].senderValidActionRole;
            const sourceValidActionRole = authorizationValues[j].sourceValidActionRole;
            const targetValidActionRole = authorizationValues[j].targetValidActionRole;
            const shouldPass = authorizationValues[j].shouldPass;

            it(`check return overridden value with undefined authorizationDataSourceActionRole`, async function() {
              await setAuthorizationDataSourceWalletLimit(senderWallet, true, skippedActionRole, senderTradeClassId);
              await setAuthorizationDataSourceWalletLimit(targetWallet, true, skippedActionRole, targetTradeClassId);
              await setAuthorizationDataSourceWalletLimit(sourceWallet, true, skippedActionRole, sourceTradeClassId);
              await setTradingClasses(senderTradeClassId, senderValidActionRole);
              await setTradingClasses(targetTradeClassId, targetValidActionRole);
              await setTradingClasses(sourceTradeClassId, sourceValidActionRole);

              await assertIsAuthorizedMethods(shouldPass);
            });

            it(`check return overridden value with defined authorizationDataSourceActionRole`, async function() {
              await setAuthorizationDataSourceWalletLimit(senderWallet, true, senderValidActionRole, senderTradeClassId);
              await setAuthorizationDataSourceWalletLimit(targetWallet, true, targetValidActionRole, targetTradeClassId);
              await setAuthorizationDataSourceWalletLimit(sourceWallet, true, sourceValidActionRole, sourceTradeClassId);
              await setTradingClasses(senderTradeClassId, invalidActionRole );
              await setTradingClasses(targetTradeClassId, invalidActionRole );
              await setTradingClasses(sourceTradeClassId, invalidActionRole );

              await assertIsAuthorizedMethods(shouldPass);
            });

            it(`check return false with invalid action role`, async function() {
              await setAuthorizationDataSourceWalletLimit(senderWallet, true, invalidActionRole, senderTradeClassId);
              await setAuthorizationDataSourceWalletLimit(targetWallet, true, invalidActionRole, targetTradeClassId);
              await setAuthorizationDataSourceWalletLimit(sourceWallet, true, invalidActionRole, sourceTradeClassId);

              await assertIsAuthorizedMethods([]);
            });

            it(`check return false with override invalid action role`, async function() {
              await setAuthorizationDataSourceWalletLimit(senderWallet, true, skippedActionRole, senderTradeClassId);
              await setAuthorizationDataSourceWalletLimit(targetWallet, true, skippedActionRole, targetTradeClassId);
              await setAuthorizationDataSourceWalletLimit(sourceWallet, true, skippedActionRole, sourceTradeClassId);
              await setTradingClasses(senderTradeClassId, invalidActionRole );
              await setTradingClasses(targetTradeClassId, invalidActionRole );
              await setTradingClasses(sourceTradeClassId, invalidActionRole );

              await assertIsAuthorizedMethods([]);
            });

            it(`check return false with missing action role`, async function() {
              await setAuthorizationDataSourceWalletLimit(senderWallet, true, 0, senderTradeClassId);
              await setAuthorizationDataSourceWalletLimit(targetWallet, true, 0, targetTradeClassId);
              await setAuthorizationDataSourceWalletLimit(sourceWallet, true, 0, sourceTradeClassId);
              await setTradingClasses(senderTradeClassId, 0 );
              await setTradingClasses(targetTradeClassId, 0 );
              await setTradingClasses(sourceTradeClassId, 0 );

              await assertIsAuthorizedMethods([]);
            });

            it(`check return false with is whitelisted false`, async function() {
              await setAuthorizationDataSourceWalletLimit(senderWallet, false, senderValidActionRole, senderTradeClassId);
              await setAuthorizationDataSourceWalletLimit(targetWallet, false, targetValidActionRole, targetTradeClassId);
              await setAuthorizationDataSourceWalletLimit(sourceWallet, false, sourceValidActionRole, sourceTradeClassId);
              await setTradingClasses(senderTradeClassId, senderValidActionRole);
              await setTradingClasses(targetTradeClassId, targetValidActionRole);
              await setTradingClasses(sourceTradeClassId, sourceValidActionRole);

              await assertIsAuthorizedMethods([]);
            });

        }

    });

    async function set                       (...args) {return await authorizationDataSource.set                       (...args);}
    async function isAuthorizedToSell        (...args) {return await sgnAuthorizationManager.isAuthorizedToSell        (...args);}
    async function isAuthorizedToTransfer    (...args) {return await sgnAuthorizationManager.isAuthorizedToTransfer    (...args);}
    async function isAuthorizedToTransferFrom(...args) {return await sgnAuthorizationManager.isAuthorizedToTransferFrom(...args);}

    async function assertIsAuthorizedMethods(shouldPass) {
      assert.equal(await sgnAuthorizationManager.isAuthorizedToSell(senderWallet), shouldPass.includes("isAuthorizedToSell"));

      assert.equal(await sgnAuthorizationManager.isAuthorizedToTransfer(senderWallet, targetWallet), shouldPass.includes("isAuthorizedToTransfer"));

      assert.equal(await sgnAuthorizationManager.isAuthorizedToTransferFrom(senderWallet, sourceWallet, targetWallet), shouldPass.includes("isAuthorizedToTransferFrom"));
    }

    async function setTradingClasses(tradeClassId, actionRole) {
      if (typeof actionRole != 'undefined')
        await tradingClasses.set(tradeClassId, actionRole, 0, 0);
    }

    async function setAuthorizationDataSourceWalletLimit(wallet, isWhitelisted, actionRole, tradeClassId) {
      if (typeof actionRole != 'undefined')
        await authorizationDataSource.set(wallet, isWhitelisted, actionRole, 0, 0, tradeClassId);
    }
});
