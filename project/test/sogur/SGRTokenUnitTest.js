contract("SGRTokenUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgrTokenManager;
    let sgrToken;

    const AMOUNT  = 1000;
    const BALANCE = 2000;

    const owner        = accounts[0];
    const sourceWallet = accounts[1];
    const targetWallet = accounts[2];
    const keeperWallet = accounts[3];
    const paymentManager  = accounts[4];
    const mintManager  = accounts[5];
    const sgnToSgrExchangeInitiator     = accounts[6];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const nullAddress = require("../utilities.js").address(0);


    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        sgrTokenManager             = await artifacts.require("SGRTokenManagerMockup"            ).new();
        sgrToken                    = await artifacts.require("SGRToken"                         ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("ISGRTokenManager", sgrTokenManager.address);
            await contractAddressLocatorProxy.set("IPaymentManager"    , paymentManager            );
            await contractAddressLocatorProxy.set("IMintManager"    , mintManager            );
            await contractAddressLocatorProxy.set("SgnToSgrExchangeInitiator"       , sgnToSgrExchangeInitiator               );
        });
        it("function mintSgrForSgnHolders should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrToken.mintSgrForSgnHolders(AMOUNT, {from: owner}));
        });
        it("function transferSgrToSgnHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrToken.transferSgrToSgnHolder(sourceWallet, AMOUNT, {from: owner}));
        });
        it("function transferEthToSgrHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgrToken.transferEthToSgrHolder(sourceWallet, AMOUNT, {from: owner}));
        });
    });

    describe("functionality assertion:", function() {
        it("fallback function should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgrToken.address);
            const tokenContractSgrBalance = await sgrToken.totalSupply();
            const sourceWalletSgrBalance  = await sgrToken.balanceOf(sourceWallet);
            await sendTransaction(sourceWallet, AMOUNT);
            await assertEqual(web3.eth.getBalance(sgrToken.address), tokenContractEthBalance.plus(AMOUNT));
            await assertEqual(sgrToken.totalSupply(), tokenContractSgrBalance.plus(AMOUNT));
            await assertEqual(sgrToken.balanceOf(sourceWallet), sourceWalletSgrBalance .plus(AMOUNT));
        });
        it("function exchange should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgrToken.address);
            const tokenContractSgrBalance = await sgrToken.totalSupply();
            const sourceWalletSgrBalance  = await sgrToken.balanceOf(sourceWallet);
            await sgrToken.exchange({from: sourceWallet, value: AMOUNT});
            await assertEqual(web3.eth.getBalance(sgrToken.address), tokenContractEthBalance.plus(AMOUNT));
            await assertEqual(sgrToken.totalSupply(), tokenContractSgrBalance.plus(AMOUNT));
            await assertEqual(sgrToken.balanceOf(sourceWallet), sourceWalletSgrBalance .plus(AMOUNT));
        });
        it("function transfer should be valid in terms of balances", async function() {
            const sourceWalletSgrBalance = await sgrToken.balanceOf(sourceWallet);
            const targetWalletSgrBalance = await sgrToken.balanceOf(targetWallet);
            await sgrToken.transfer(targetWallet, AMOUNT, {from: sourceWallet});
            await assertEqual(sgrToken.balanceOf(sourceWallet), sourceWalletSgrBalance.minus(AMOUNT));
            await assertEqual(sgrToken.balanceOf(targetWallet), targetWalletSgrBalance.plus (AMOUNT));
        });
        it("function transferFrom should be valid in terms of balances", async function() {
            const sourceWalletSgrBalance = await sgrToken.balanceOf(sourceWallet);
            const targetWalletSgrBalance = await sgrToken.balanceOf(targetWallet);
            await sgrToken.approve(keeperWallet, AMOUNT, {from: sourceWallet});
            await sgrToken.transferFrom(sourceWallet, targetWallet, AMOUNT, {from: keeperWallet});
            await assertEqual(sgrToken.balanceOf(sourceWallet), sourceWalletSgrBalance.minus(AMOUNT));
            await assertEqual(sgrToken.balanceOf(targetWallet), targetWalletSgrBalance.plus (AMOUNT));
        });
        it("function deposit should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgrToken.address);
            await sgrToken.deposit({from: sourceWallet, value: AMOUNT});
            await assertEqual(web3.eth.getBalance(sgrToken.address), tokenContractEthBalance.plus(AMOUNT));
        });
        it("function withdraw should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgrToken.address);
            await sgrToken.withdraw({from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgrToken.address), tokenContractEthBalance.minus(tokenContractEthBalance));
        });
        it("function mintSgrForSgnHolders should be valid in terms of balances", async function() {
            const SGR_MINTED_FOR_SGN_HOLDERS = await sgrToken.SGR_MINTED_FOR_SGN_HOLDERS();
            const tokenContractSgrBalance    = await sgrToken.totalSupply();
            const sgrMintedForSgnHolders     = await sgrToken.balanceOf(SGR_MINTED_FOR_SGN_HOLDERS);
            await sgrToken.mintSgrForSgnHolders(AMOUNT, {from: mintManager});
            await assertEqual(sgrToken.totalSupply(), tokenContractSgrBalance.plus(AMOUNT));
            await assertEqual(sgrToken.balanceOf(SGR_MINTED_FOR_SGN_HOLDERS), sgrMintedForSgnHolders .plus(AMOUNT));
        });
        it("function transferSgrToSgnHolder should be valid in terms of balances", async function() {
            await sgrToken.mintSgrForSgnHolders(AMOUNT, {from: mintManager});
            const SGR_MINTED_FOR_SGN_HOLDERS = await sgrToken.SGR_MINTED_FOR_SGN_HOLDERS();
            const sgrMintedForSgnHolders     = await sgrToken.balanceOf(SGR_MINTED_FOR_SGN_HOLDERS);
            const targetWalletSgrBalance     = await sgrToken.balanceOf(targetWallet);
            await sgrToken.transferSgrToSgnHolder(targetWallet, AMOUNT, {from: sgnToSgrExchangeInitiator});
            await assertEqual(sgrToken.balanceOf(SGR_MINTED_FOR_SGN_HOLDERS), sgrMintedForSgnHolders.minus(AMOUNT));
            await assertEqual(sgrToken.balanceOf(targetWallet), targetWalletSgrBalance.plus (AMOUNT));
        });
        it("function transferEthToSgrHolder should be valid in terms of balances", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            const tokenContractEthBalance = await web3.eth.getBalance(sgrToken.address);
            const targetWalletEthBalance  = await web3.eth.getBalance(targetWallet);
            await sgrToken.transferEthToSgrHolder(targetWallet, AMOUNT, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgrToken.address), tokenContractEthBalance.minus(AMOUNT));
            await assertEqual(web3.eth.getBalance(targetWallet), targetWalletEthBalance .plus (AMOUNT));
        });
    });

    describe("token-selling assertion:", function() {
        it("function transfer should be valid in terms of balances", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            const tokenContractEthBalance = await web3.eth.getBalance(sgrToken.address);
            const tokenContractSgrBalance = await sgrToken.totalSupply();
            const sourceWalletSgrBalance  = await sgrToken.balanceOf(sourceWallet);
            await sgrToken.transfer(sgrToken.address, AMOUNT, {from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgrToken.address), tokenContractEthBalance.minus(AMOUNT));
            await assertEqual(sgrToken.totalSupply(), tokenContractSgrBalance.minus(AMOUNT));
            await assertEqual(sgrToken.balanceOf(sourceWallet), sourceWalletSgrBalance .minus(AMOUNT));
        });
        it("function transferFrom should abort with an error", async function() {
            await sgrToken.approve(keeperWallet, AMOUNT, {from: sourceWallet});
            await catchRevert(sgrToken.transferFrom(sourceWallet, sgrToken.address, AMOUNT, {from: keeperWallet}));
        });
    });

    describe("implicit-payment assertion:", function() {
        it("function transfer should complete successfully if the amount is less than the balance", async function() {
            await sendTransaction(sourceWallet, BALANCE - 1);
            await sgrToken.withdraw({from: sourceWallet});
            await sgrToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgrToken.transfer(sgrToken.address, BALANCE - 1, {from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgrToken.address), 1);
        });
        it("function transfer should complete successfully if the amount is equal to the balance", async function() {
            await sendTransaction(sourceWallet, BALANCE * 1);
            await sgrToken.withdraw({from: sourceWallet});
            await sgrToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgrToken.transfer(sgrToken.address, BALANCE * 1, {from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgrToken.address), 0);
        });
        it("function transfer should abort with an error if the amount is more than the balance", async function() {
            await sendTransaction(sourceWallet, BALANCE + 1);
            await sgrToken.withdraw({from: sourceWallet});
            await sgrToken.deposit ({from: sourceWallet, value: BALANCE});
            await catchRevert(sgrToken.transfer(sgrToken.address, BALANCE + 1, {from: sourceWallet}));
            await assertEqual(web3.eth.getBalance(sgrToken.address), BALANCE);
        });
    });

    describe("explicit-payment assertion:", function() {
        it("function transferEthToSgrHolder should complete successfully if the amount is less than the balance", async function() {
            await sgrToken.withdraw({from: sourceWallet});
            await sgrToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgrToken.transferEthToSgrHolder(targetWallet, BALANCE - 1, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgrToken.address), 1);
        });
        it("function transferEthToSgrHolder should complete successfully if the amount is equal to the balance", async function() {
            await sgrToken.withdraw({from: sourceWallet});
            await sgrToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgrToken.transferEthToSgrHolder(targetWallet, BALANCE * 1, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgrToken.address), 0);
        });
        it("function transferEthToSgrHolder should complete successfully if the amount is more than the balance", async function() {
            await sgrToken.withdraw({from: sourceWallet});
            await sgrToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgrToken.transferEthToSgrHolder(targetWallet, BALANCE + 1, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgrToken.address), BALANCE);
        });
    });

    describe("information-retrieval assertion:", function() {
        it("function getEthBalance should return the correct value", async function() {
            const expected = await web3.eth.getBalance(sgrToken.address);
            const actual   = await sgrToken.getEthBalance();
            assert.equal(actual.toFixed(), expected.toFixed());
        });
        it("function getDepositParams should return the correct values", async function() {
            const expected = await web3.eth.getBalance(sgrToken.address);
            const actual   = await sgrToken.getDepositParams();
            assert.equal(actual[0], sgrToken.address);
            assert.equal(actual[1].toFixed(), expected.toFixed());
        });
        it("function getWithdrawParams should return the correct values", async function() {
            const expected = await web3.eth.getBalance(sgrToken.address);
            const actual   = await sgrToken.getWithdrawParams();
            assert.equal(actual[0], sgrToken.address);
            assert.equal(actual[1].toFixed(), expected.toFixed());
        });
    });

    describe("SGRTokenInfo functionality assertion:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            sgrTokenManager             = await artifacts.require("SGRTokenManagerMockup"            ).new();
            sgrTokenInfoMockup             = await artifacts.require("SGRTokenInfoMockup"            ).new();
            sgrToken                    = await artifacts.require("SGRToken"                         ).new(contractAddressLocatorProxy.address);
            await contractAddressLocatorProxy.set("ISGRTokenManager", sgrTokenManager.address);
            await contractAddressLocatorProxy.set("ISGRTokenInfo", sgrTokenInfoMockup.address);
        });

        it("should return valid name", async function() {
            assert.equal(await sgrToken.name(), "testName");
            assert.equal(await sgrToken.name.call(), "testName");
        });

        it("should return valid symbol", async function() {
            assert.equal(await sgrToken.symbol(), "testSymbol");
            assert.equal(await sgrToken.symbol.call(), "testSymbol");
        });

        it("should return valid decimals", async function() {
            assert.equal(await sgrToken.decimals(), 18);
            assert.equal(await sgrToken.decimals.call(), 18);
        });
    });

    describe("init function assertions:", function() {
        let validExecutor = accounts[5];
        let sgaToSGRTokenExchangeAddress = accounts[6];
        let sgaToSGRTokenExchangeSGRSupply = 1000;

        beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            sgrTokenManager             = await artifacts.require("SGRTokenManagerMockup"            ).new();
            sgrToken                    = await artifacts.require("SGRToken"                         ).new(contractAddressLocatorProxy.address);
            await contractAddressLocatorProxy.set("IMintManager"    , mintManager            );
            await contractAddressLocatorProxy.set("SgnToSgrExchangeInitiator"       , sgnToSgrExchangeInitiator               );
            await contractAddressLocatorProxy.set("ISGRTokenManager", sgrTokenManager.address);
            await contractAddressLocatorProxy.set("SGAToSGRInitializer", validExecutor);
        });
        it("should abort with an error if called by not authorized", async function() {
           await catchRevert(sgrToken.init(sgaToSGRTokenExchangeAddress, sgaToSGRTokenExchangeSGRSupply, {from: owner}));
        });

        it("should abort with an error if already initialized", async function() {
           await sgrToken.init(sgaToSGRTokenExchangeAddress, sgaToSGRTokenExchangeSGRSupply, {from: validExecutor});
           await catchRevert(sgrToken.init(sgaToSGRTokenExchangeAddress, sgaToSGRTokenExchangeSGRSupply, {from: validExecutor}));
        });

        it("should abort with an error if called with null address", async function() {
           await catchRevert(sgrToken.init(nullAddress, sgaToSGRTokenExchangeSGRSupply, {from: validExecutor}));
        });

        it("should succeed and mint sgr supply for sgaToSGRTokenExchangeAddress", async function() {
           await sgrToken.init(sgaToSGRTokenExchangeAddress, sgaToSGRTokenExchangeSGRSupply, {from: validExecutor});
           const actualBalanceOfExchanger = await sgrToken.balanceOf(sgaToSGRTokenExchangeAddress);
           assert(actualBalanceOfExchanger, sgaToSGRTokenExchangeSGRSupply);
        });
    });

    describe("after functions assertion:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            sgrTokenManager             = await artifacts.require("SGRTokenManagerMockup"            ).new();
            sgrToken                    = await artifacts.require("SGRToken"                         ).new(contractAddressLocatorProxy.address);
            await contractAddressLocatorProxy.set("IMintManager"    , mintManager            );
            await contractAddressLocatorProxy.set("SgnToSgrExchangeInitiator"       , sgnToSgrExchangeInitiator               );
            await contractAddressLocatorProxy.set("ISGRTokenManager", sgrTokenManager.address);
        });
        it("afterExchangeEthForSgr via fallback function", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            await assertAfterValues({sender : sourceWallet, sgrAmount : AMOUNT, ethAmount : AMOUNT});
        });

        it("afterExchangeEthForSgr via exchange function", async function() {
            await sgrToken.exchange({from: sourceWallet, value: AMOUNT});
            await assertAfterValues({sender : sourceWallet, sgrAmount : AMOUNT, ethAmount : AMOUNT});
        });

        it("afterExchangeSgrForEth via transfer", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            await sgrToken.transfer(sgrToken.address, AMOUNT, {from: sourceWallet});
            await assertAfterValues({sender : sourceWallet, sgrAmount : AMOUNT, ethAmount : AMOUNT});
        });

        it("afterTransfer via transfer", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            await sgrToken.transfer(targetWallet, AMOUNT, {from: sourceWallet});
            await assertAfterValues({sender : sourceWallet, to : targetWallet, boolResult : true, value : AMOUNT});
        });

        it("afterTransferFrom via transferFrom", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            await sgrToken.approve(keeperWallet, AMOUNT, {from: sourceWallet});
            await sgrToken.transferFrom(sourceWallet, targetWallet, AMOUNT, {from: keeperWallet});
            await assertAfterValues({sender : keeperWallet, from : sourceWallet, to : targetWallet, boolResult : true, value : AMOUNT});
        });

        it("afterWithdraw via withdraw", async function() {
            await sgrToken.deposit({from: sourceWallet, value: AMOUNT});
            const response = await sgrToken.withdraw({from: sourceWallet});
            await assertAfterValues({sender : sourceWallet, wallet : sourceWallet, amount : AMOUNT, priorWithdrawEthBalance : AMOUNT, afterWithdrawEthBalance : 0});
        });

        it("afterMintSgrForSgnHolders", async function() {
            const response =  await sgrToken.mintSgrForSgnHolders(AMOUNT, {from: mintManager});
            await assertAfterValues({value : AMOUNT});
        });

        it("afterTransferSgrToSgnHolder", async function() {
            await sgrToken.mintSgrForSgnHolders(AMOUNT, {from: mintManager});
            const response = await sgrToken.transferSgrToSgnHolder(targetWallet, AMOUNT, {from: sgnToSgrExchangeInitiator});
            await assertAfterValues({to : targetWallet, value : AMOUNT});
        });
    });
    async function assertAfterValues(valuesToAssert) {
        if (valuesToAssert.hasOwnProperty('from')){
        assert.equal(await sgrTokenManager.from.call(),valuesToAssert.from);
        }

        if (valuesToAssert.hasOwnProperty('sender')){
        assert.equal(await sgrTokenManager.sender.call(),valuesToAssert.sender);
        }

        if (valuesToAssert.hasOwnProperty('wallet')){
        assert.equal(await sgrTokenManager.wallet.call(),valuesToAssert.wallet);
        }

        if (valuesToAssert.hasOwnProperty('to')){
        assert.equal(await sgrTokenManager.to.call(),valuesToAssert.to);
        }

        if (valuesToAssert.hasOwnProperty('boolResult')){
        assert.equal(await sgrTokenManager.boolResult.call(),valuesToAssert.boolResult);
        }

        if (valuesToAssert.hasOwnProperty('value')){
        assert.equal(await sgrTokenManager.value.call(),valuesToAssert.value);
        }

        if (valuesToAssert.hasOwnProperty('amount')){
        assert.equal(await sgrTokenManager.amount.call(),valuesToAssert.amount);
        }

        if (valuesToAssert.hasOwnProperty('sgrAmount')){
        assert.equal(await sgrTokenManager.sgrAmount.call(),valuesToAssert.sgrAmount);
        }

        if (valuesToAssert.hasOwnProperty('ethAmount')){
        assert.equal(await sgrTokenManager.ethAmount.call(),valuesToAssert.ethAmount);
        }

        if (valuesToAssert.hasOwnProperty('priorWithdrawEthBalance')){
        assert.equal(await sgrTokenManager.priorWithdrawEthBalance.call(),valuesToAssert.priorWithdrawEthBalance);
        }

        if (valuesToAssert.hasOwnProperty('afterWithdrawEthBalance')){
        assert.equal(await sgrTokenManager.afterWithdrawEthBalance.call(),valuesToAssert.afterWithdrawEthBalance);
        }
    }

    async function sendTransaction(wallet, amount) {
        let estimatedGas = await web3.eth.estimateGas({from: wallet, to: sgrToken.address, value: amount} );
        //console.log("estimatedGas "+ estimatedGas);
        return await web3.eth.sendTransaction({from: wallet, to: sgrToken.address, value: amount, gas : estimatedGas +1000});
    }
});
