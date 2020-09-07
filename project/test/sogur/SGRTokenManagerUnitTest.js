contract("SGRTokenManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgrAuthorizationManager;
    let transactionManager;
    let walletsTradingLimiterMockup;
    let reserveManager;
    let paymentManager;
    let redButton;
    let sgrTokenManager;

    const AMOUNT  = 1000;
    const BALANCE = 2000;

    const owner        = accounts[0];
    const senderWallet = accounts[1];
    const targetWallet = accounts[2];
    const sourceWallet = accounts[3];

    const nullAddress        = require("../utilities.js").address(0);
    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        sgrAuthorizationManager     = await artifacts.require("SGRAuthorizationManagerMockup"    ).new();
        transactionManager          = await artifacts.require("TransactionManagerMockup"         ).new();
        walletsTradingLimiterMockup              = await artifacts.require("WalletsTradingLimiterMockup"             ).new();
        reserveManager              = await artifacts.require("ReserveManagerMockup"             ).new();
        paymentManager                 = await artifacts.require("PaymentManagerMockup"                ).new();
        redButton                   = await artifacts.require("RedButtonMockup"                  ).new();
        sgrTokenManager             = await artifacts.require("SGRTokenManager"                  ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("ISGRAuthorizationManager", sgrAuthorizationManager.address);
            await contractAddressLocatorProxy.set("ITransactionManager"     , transactionManager     .address);
            await contractAddressLocatorProxy.set("SellWalletsTLSGRTokenManager"         , walletsTradingLimiterMockup         .address);
            await contractAddressLocatorProxy.set("BuyWalletsTLSGRTokenManager"         , walletsTradingLimiterMockup         .address);
            await contractAddressLocatorProxy.set("IReserveManager"         , reserveManager         .address);
            await contractAddressLocatorProxy.set("IPaymentManager"            , paymentManager            .address);
            await contractAddressLocatorProxy.set("IRedButton"              , redButton              .address);
            await sgrAuthorizationManager.setState(true);
            await reserveManager.setState(senderWallet, BALANCE);
        });
        it("function exchangeEthForSgr should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.exchangeEthForSgr(senderWallet, AMOUNT, {from: owner}));
        });
        it("function exchangeSgrForEth should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.exchangeSgrForEth(senderWallet, AMOUNT, {from: owner}));
        });
        it("function uponTransfer should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT, {from: owner}));
        });
        it("function uponTransferFrom should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT, {from: owner}));
        });
        it("function uponDeposit should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT, {from: owner}));
        });
        it("function uponWithdraw should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.uponWithdraw(senderWallet, BALANCE, {from: owner}));
        });
        it("function uponMintSgrForSgnHolders should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.uponMintSgrForSgnHolders(AMOUNT, {from: owner}));
        });
        it("function uponTransferSgrToSgnHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.uponTransferSgrToSgnHolder(targetWallet, AMOUNT, {from: owner}));
        });
        it("function postTransferEthToSgrHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.postTransferEthToSgrHolder(targetWallet, AMOUNT, true, {from: owner}));
        });
        it("function getDepositParams should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.getDepositParams({from: owner}));
        });
        it("function getWithdrawParams should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrTokenManager.getWithdrawParams({from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("ISGRToken", owner);
        });
    });

    describe("functionality assertion:", function() {
        beforeEach(async function() {
            await walletsTradingLimiterMockup.setPass(true);
        });
        it("function exchangeEthForSgr should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.exchangeEthForSgr(senderWallet, AMOUNT), "ExchangeEthForSgrCompleted");
        });
        it("function exchangeEthForSgr should abort if exceed limit", async function() {
            await walletsTradingLimiterMockup.setPass(false);
            await catchRevert(sgrTokenManager.exchangeEthForSgr(senderWallet, AMOUNT));
        });
        it("function exchangeSgrForEth should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.exchangeSgrForEth(senderWallet, AMOUNT), "ExchangeSgrForEthCompleted");
        });
        it("function exchangeSgrForEth should abort if exceed limit", async function() {
                    await walletsTradingLimiterMockup.setPass(false);
                    await catchRevert(sgrTokenManager.exchangeSgrForEth(senderWallet, AMOUNT));
        });
        it("function uponTransfer should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT), "");
        });
        it("function uponTransferFrom should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT), "");
        });
        it("function uponDeposit should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT), "DepositCompleted");
        });
        it("function uponWithdraw should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.uponWithdraw(senderWallet, BALANCE), "WithdrawCompleted");
        });
        it("function uponMintSgrForSgnHolders should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.uponMintSgrForSgnHolders(AMOUNT), "MintSgrForSgnHoldersCompleted");
        });
        it("function uponTransferSgrToSgnHolder should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.uponTransferSgrToSgnHolder(targetWallet, AMOUNT), "TransferSgrToSgnHolderCompleted");
        });
        it("function postTransferEthToSgrHolder should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.postTransferEthToSgrHolder(targetWallet, AMOUNT, true), "TransferEthToSgrHolderCompleted");
        });
        it("function getDepositParams should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.getDepositParams(), "");
        });
        it("function getWithdrawParams should complete successfully", async function() {
            await verifyEvent(sgrTokenManager.getWithdrawParams(), "");
        });
    });

    describe("token-selling assertion:", function() {
        it("function exchangeSgrForEth should complete successfully if the amount is less than the balance", async function() {
            await sgrTokenManager.exchangeSgrForEth(senderWallet, (await web3.eth.getBalance(owner)).minus(1), {from: owner});
        });
        it("function exchangeSgrForEth should complete successfully if the amount is equal to the balance", async function() {
            await sgrTokenManager.exchangeSgrForEth(senderWallet, (await web3.eth.getBalance(owner)).times(1), {from: owner});
        });
        it("function exchangeSgrForEth should complete successfully if the amount is more than the balance", async function() {
            await sgrTokenManager.exchangeSgrForEth(senderWallet, (await web3.eth.getBalance(owner)).plus(1), {from: owner});
        });
    });

    describe("authorization assertion:", function() {
        before(async function() {
            await sgrAuthorizationManager.setState(false);
        });
        it("function exchangeEthForSgr should abort with an error if unauthorized", async function() {
            await catchRevert(sgrTokenManager.exchangeEthForSgr(senderWallet, AMOUNT));
        });
        it("function exchangeSgrForEth should abort with an error if unauthorized", async function() {
            await catchRevert(sgrTokenManager.exchangeSgrForEth(senderWallet, AMOUNT));
        });
        it("function uponWithdraw should abort with an error if unauthorized", async function() {
            await catchRevert(sgrTokenManager.uponWithdraw(senderWallet, BALANCE));
        });
        after(async function() {
            await sgrAuthorizationManager.setState(true);
        });
    });

    describe("reserve-wallet assertion:", function() {
        before(async function() {
            await reserveManager.setState(nullAddress, BALANCE);
        });
        it("function uponDeposit should abort with an error if the reserve wallet is wrong", async function() {
            await catchRevert(sgrTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT));
        });
        it("function uponWithdraw should abort with an error if the reserve wallet is wrong", async function() {
            await catchRevert(sgrTokenManager.uponWithdraw(senderWallet, BALANCE));
        });
        after(async function() {
            await reserveManager.setState(senderWallet, BALANCE);
        });
    });

    describe("reserve-amount assertion:", function() {
        before(async function() {
            await reserveManager.setState(senderWallet, 0);
        });
        it("function uponDeposit should abort with an error if the reserve amount is wrong", async function() {
            await catchRevert(sgrTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT));
        });
        it("function uponWithdraw should abort with an error if the reserve amount is wrong", async function() {
            await catchRevert(sgrTokenManager.uponWithdraw(senderWallet, BALANCE));
        });
        after(async function() {
            await reserveManager.setState(senderWallet, BALANCE);
        });
    });

    describe("red-button assertion:", function() {
        before(async function() {
            await redButton.setEnabled(true);
        });
        it("function exchangeEthForSgr should abort with an error if called when red-button is enabled", async function() {
            await catchRevert(sgrTokenManager.exchangeEthForSgr(senderWallet, AMOUNT));
        });
        it("function exchangeSgrForEth should abort with an error if called when red-button is enabled", async function() {
            await catchRevert(sgrTokenManager.exchangeSgrForEth(senderWallet, AMOUNT));
        });
        it("function uponTransferSgrToSgnHolder should abort with an error if called when red-button is enabled", async function() {
            await catchRevert(sgrTokenManager.uponTransferSgrToSgnHolder(targetWallet, AMOUNT));
        });
        after(async function() {
            await redButton.setEnabled(false);
        });
    });

    describe("payment-handling assertion:", function() {
        before(async function() {
            await paymentManager.setError(true);
        });
        it("function exchangeSgrForEth should abort with an error if payment-calculation is erroneous", async function() {
            await catchInvalidOpcode(sgrTokenManager.exchangeSgrForEth(senderWallet, AMOUNT));
        });
        after(async function() {
            await paymentManager.setError(false);
        });
    });

      describe("after functions assertion:", function() {
          beforeEach(async function() {
              contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
              sgrTokenManager            = await artifacts.require("SGRTokenManager"                  ).new(contractAddressLocatorProxy.address);
              sgrTokenManagerTester            = await artifacts.require("SGRTokenManagerTester"                  ).new(sgrTokenManager.address);
          });
          it("afterExchangeEthForSgr", async function() {
              await sgrTokenManager.afterExchangeEthForSgr(senderWallet, AMOUNT, AMOUNT);
          });

          it("afterExchangeSgrForEth", async function() {
              await sgrTokenManagerTester.afterExchangeSgrForEth(senderWallet, AMOUNT, AMOUNT)
              assert.isTrue(await sgrTokenManagerTester.boolResult.call());
          });

          it("afterTransfer", async function() {
              await sgrTokenManagerTester.afterTransfer(senderWallet, targetWallet, AMOUNT, true);
              assert.isTrue(await sgrTokenManagerTester.boolResult.call());
              await sgrTokenManagerTester.afterTransfer(senderWallet, targetWallet, AMOUNT, false)
              assert.isFalse(await sgrTokenManagerTester.boolResult.call());
          });

            it("afterTransferFrom", async function() {
              await sgrTokenManagerTester.afterTransferFrom(senderWallet, senderWallet, targetWallet, 1000, true);
              assert.isTrue(await sgrTokenManagerTester.boolResult.call());
              await sgrTokenManagerTester.afterTransferFrom(senderWallet, senderWallet, targetWallet, 1000, false);
              assert.isFalse(await sgrTokenManagerTester.boolResult.call());
            });

            it("afterWithdraw", async function() {
               await sgrTokenManager.afterWithdraw(senderWallet, targetWallet, AMOUNT, AMOUNT, AMOUNT);
            });

            it("afterMintSgrForSgnHolders", async function() {
              await sgrTokenManager.afterMintSgrForSgnHolders(AMOUNT);
            });

              it("afterTransferSgrToSgnHolder", async function() {
              await sgrTokenManager.afterTransferSgrToSgnHolder(targetWallet, AMOUNT);
            });
        });

    async function verifyEvent(promise, expected) {
        const response = await promise;
        const logs     = response.logs;
        const actual   = logs && logs[0] ? logs[0].event : "";
        assert(actual == expected, `expected = ${expected}, actual = ${actual}`);
    }
});
