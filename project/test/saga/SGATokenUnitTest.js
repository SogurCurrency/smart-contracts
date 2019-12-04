contract("SGATokenUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgaTokenManager;
    let sgaToken;

    const AMOUNT  = 1000;
    const BALANCE = 2000;

    const owner        = accounts[0];
    const sourceWallet = accounts[1];
    const targetWallet = accounts[2];
    const keeperWallet = accounts[3];
    const paymentManager  = accounts[4];
    const mintManager  = accounts[5];
    const sgnToken     = accounts[6];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        sgaTokenManager             = await artifacts.require("SGATokenManagerMockup"            ).new();
        sgaToken                    = await artifacts.require("SGAToken"                         ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("ISGATokenManager", sgaTokenManager.address);
            await contractAddressLocatorProxy.set("IPaymentManager"    , paymentManager            );
            await contractAddressLocatorProxy.set("IMintManager"    , mintManager            );
            await contractAddressLocatorProxy.set("ISGNToken"       , sgnToken               );
        });
        it("function mintSgaForSgnHolders should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaToken.mintSgaForSgnHolders(AMOUNT, {from: owner}));
        });
        it("function transferSgaToSgnHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaToken.transferSgaToSgnHolder(sourceWallet, AMOUNT, {from: owner}));
        });
        it("function transferEthToSgaHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaToken.transferEthToSgaHolder(sourceWallet, AMOUNT, {from: owner}));
        });
    });

    describe("functionality assertion:", function() {
        it("fallback function should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgaToken.address);
            const tokenContractSgaBalance = await sgaToken.totalSupply();
            const sourceWalletSgaBalance  = await sgaToken.balanceOf(sourceWallet);
            await sendTransaction(sourceWallet, AMOUNT);
            await assertEqual(web3.eth.getBalance(sgaToken.address), tokenContractEthBalance.plus(AMOUNT));
            await assertEqual(sgaToken.totalSupply(), tokenContractSgaBalance.plus(AMOUNT));
            await assertEqual(sgaToken.balanceOf(sourceWallet), sourceWalletSgaBalance .plus(AMOUNT));
        });
        it("function exchange should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgaToken.address);
            const tokenContractSgaBalance = await sgaToken.totalSupply();
            const sourceWalletSgaBalance  = await sgaToken.balanceOf(sourceWallet);
            await sgaToken.exchange({from: sourceWallet, value: AMOUNT});
            await assertEqual(web3.eth.getBalance(sgaToken.address), tokenContractEthBalance.plus(AMOUNT));
            await assertEqual(sgaToken.totalSupply(), tokenContractSgaBalance.plus(AMOUNT));
            await assertEqual(sgaToken.balanceOf(sourceWallet), sourceWalletSgaBalance .plus(AMOUNT));
        });
        it("function transfer should be valid in terms of balances", async function() {
            const sourceWalletSgaBalance = await sgaToken.balanceOf(sourceWallet);
            const targetWalletSgaBalance = await sgaToken.balanceOf(targetWallet);
            await sgaToken.transfer(targetWallet, AMOUNT, {from: sourceWallet});
            await assertEqual(sgaToken.balanceOf(sourceWallet), sourceWalletSgaBalance.minus(AMOUNT));
            await assertEqual(sgaToken.balanceOf(targetWallet), targetWalletSgaBalance.plus (AMOUNT));
        });
        it("function transferFrom should be valid in terms of balances", async function() {
            const sourceWalletSgaBalance = await sgaToken.balanceOf(sourceWallet);
            const targetWalletSgaBalance = await sgaToken.balanceOf(targetWallet);
            await sgaToken.approve(keeperWallet, AMOUNT, {from: sourceWallet});
            await sgaToken.transferFrom(sourceWallet, targetWallet, AMOUNT, {from: keeperWallet});
            await assertEqual(sgaToken.balanceOf(sourceWallet), sourceWalletSgaBalance.minus(AMOUNT));
            await assertEqual(sgaToken.balanceOf(targetWallet), targetWalletSgaBalance.plus (AMOUNT));
        });
        it("function deposit should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgaToken.address);
            await sgaToken.deposit({from: sourceWallet, value: AMOUNT});
            await assertEqual(web3.eth.getBalance(sgaToken.address), tokenContractEthBalance.plus(AMOUNT));
        });
        it("function withdraw should be valid in terms of balances", async function() {
            const tokenContractEthBalance = await web3.eth.getBalance(sgaToken.address);
            await sgaToken.withdraw({from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgaToken.address), tokenContractEthBalance.minus(tokenContractEthBalance));
        });
        it("function mintSgaForSgnHolders should be valid in terms of balances", async function() {
            const SGA_MINTED_FOR_SGN_HOLDERS = await sgaToken.SGA_MINTED_FOR_SGN_HOLDERS();
            const tokenContractSgaBalance    = await sgaToken.totalSupply();
            const sgaMintedForSgnHolders     = await sgaToken.balanceOf(SGA_MINTED_FOR_SGN_HOLDERS);
            await sgaToken.mintSgaForSgnHolders(AMOUNT, {from: mintManager});
            await assertEqual(sgaToken.totalSupply(), tokenContractSgaBalance.plus(AMOUNT));
            await assertEqual(sgaToken.balanceOf(SGA_MINTED_FOR_SGN_HOLDERS), sgaMintedForSgnHolders .plus(AMOUNT));
        });
        it("function transferSgaToSgnHolder should be valid in terms of balances", async function() {
            await sgaToken.mintSgaForSgnHolders(AMOUNT, {from: mintManager});
            const SGA_MINTED_FOR_SGN_HOLDERS = await sgaToken.SGA_MINTED_FOR_SGN_HOLDERS();
            const sgaMintedForSgnHolders     = await sgaToken.balanceOf(SGA_MINTED_FOR_SGN_HOLDERS);
            const targetWalletSgaBalance     = await sgaToken.balanceOf(targetWallet);
            await sgaToken.transferSgaToSgnHolder(targetWallet, AMOUNT, {from: sgnToken});
            await assertEqual(sgaToken.balanceOf(SGA_MINTED_FOR_SGN_HOLDERS), sgaMintedForSgnHolders.minus(AMOUNT));
            await assertEqual(sgaToken.balanceOf(targetWallet), targetWalletSgaBalance.plus (AMOUNT));
        });
        it("function transferEthToSgaHolder should be valid in terms of balances", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            const tokenContractEthBalance = await web3.eth.getBalance(sgaToken.address);
            const targetWalletEthBalance  = await web3.eth.getBalance(targetWallet);
            await sgaToken.transferEthToSgaHolder(targetWallet, AMOUNT, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgaToken.address), tokenContractEthBalance.minus(AMOUNT));
            await assertEqual(web3.eth.getBalance(targetWallet), targetWalletEthBalance .plus (AMOUNT));
        });
    });

    describe("token-selling assertion:", function() {
        it("function transfer should be valid in terms of balances", async function() {
            await sendTransaction(sourceWallet, AMOUNT);
            const tokenContractEthBalance = await web3.eth.getBalance(sgaToken.address);
            const tokenContractSgaBalance = await sgaToken.totalSupply();
            const sourceWalletSgaBalance  = await sgaToken.balanceOf(sourceWallet);
            await sgaToken.transfer(sgaToken.address, AMOUNT, {from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgaToken.address), tokenContractEthBalance.minus(AMOUNT));
            await assertEqual(sgaToken.totalSupply(), tokenContractSgaBalance.minus(AMOUNT));
            await assertEqual(sgaToken.balanceOf(sourceWallet), sourceWalletSgaBalance .minus(AMOUNT));
        });
        it("function transferFrom should abort with an error", async function() {
            await sgaToken.approve(keeperWallet, AMOUNT, {from: sourceWallet});
            await catchRevert(sgaToken.transferFrom(sourceWallet, sgaToken.address, AMOUNT, {from: keeperWallet}));
        });
    });

    describe("implicit-payment assertion:", function() {
        it("function transfer should complete successfully if the amount is less than the balance", async function() {
            await sendTransaction(sourceWallet, BALANCE - 1);
            await sgaToken.withdraw({from: sourceWallet});
            await sgaToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgaToken.transfer(sgaToken.address, BALANCE - 1, {from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgaToken.address), 1);
        });
        it("function transfer should complete successfully if the amount is equal to the balance", async function() {
            await sendTransaction(sourceWallet, BALANCE * 1);
            await sgaToken.withdraw({from: sourceWallet});
            await sgaToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgaToken.transfer(sgaToken.address, BALANCE * 1, {from: sourceWallet});
            await assertEqual(web3.eth.getBalance(sgaToken.address), 0);
        });
        it("function transfer should abort with an error if the amount is more than the balance", async function() {
            await sendTransaction(sourceWallet, BALANCE + 1);
            await sgaToken.withdraw({from: sourceWallet});
            await sgaToken.deposit ({from: sourceWallet, value: BALANCE});
            await catchRevert(sgaToken.transfer(sgaToken.address, BALANCE + 1, {from: sourceWallet}));
            await assertEqual(web3.eth.getBalance(sgaToken.address), BALANCE);
        });
    });

    describe("explicit-payment assertion:", function() {
        it("function transferEthToSgaHolder should complete successfully if the amount is less than the balance", async function() {
            await sgaToken.withdraw({from: sourceWallet});
            await sgaToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgaToken.transferEthToSgaHolder(targetWallet, BALANCE - 1, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgaToken.address), 1);
        });
        it("function transferEthToSgaHolder should complete successfully if the amount is equal to the balance", async function() {
            await sgaToken.withdraw({from: sourceWallet});
            await sgaToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgaToken.transferEthToSgaHolder(targetWallet, BALANCE * 1, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgaToken.address), 0);
        });
        it("function transferEthToSgaHolder should complete successfully if the amount is more than the balance", async function() {
            await sgaToken.withdraw({from: sourceWallet});
            await sgaToken.deposit ({from: sourceWallet, value: BALANCE});
            await sgaToken.transferEthToSgaHolder(targetWallet, BALANCE + 1, {from: paymentManager});
            await assertEqual(web3.eth.getBalance(sgaToken.address), BALANCE);
        });
    });

    describe("information-retrieval assertion:", function() {
        it("function getEthBalance should return the correct value", async function() {
            const expected = await web3.eth.getBalance(sgaToken.address);
            const actual   = await sgaToken.getEthBalance();
            assert.equal(actual.toFixed(), expected.toFixed());
        });
        it("function getDepositParams should return the correct values", async function() {
            const expected = await web3.eth.getBalance(sgaToken.address);
            const actual   = await sgaToken.getDepositParams();
            assert.equal(actual[0], sgaToken.address);
            assert.equal(actual[1].toFixed(), expected.toFixed());
        });
        it("function getWithdrawParams should return the correct values", async function() {
            const expected = await web3.eth.getBalance(sgaToken.address);
            const actual   = await sgaToken.getWithdrawParams();
            assert.equal(actual[0], sgaToken.address);
            assert.equal(actual[1].toFixed(), expected.toFixed());
        });
    });

    async function sendTransaction(wallet, amount) {
        await web3.eth.sendTransaction({from: wallet, to: sgaToken.address, value: amount});
    }
});
