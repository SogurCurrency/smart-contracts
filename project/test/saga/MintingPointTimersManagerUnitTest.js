contract("MintingPointTimersManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let mintingPointTimersManager;

    const TIMEOUT = 100;
    const owner   = accounts[0];

    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        mintingPointTimersManager                 = await artifacts.require("MintingPointTimersManager"                      ).new(contractAddressLocatorProxy.address, TIMEOUT);
    });

    describe("security assertion:", function() {
        it("function start should abort with an error if called by a non-user", async function() {
            await catchRevert(mintingPointTimersManager.start(0, {from: owner}));
        });
        it("function reset should abort with an error if called by a non-user", async function() {
            await catchRevert(mintingPointTimersManager.reset(0, {from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("IIntervalIterator", owner);
        });
    });

    describe("integrity assertion:", function() {
        it("function start should abort with an error if called consecutively", async function() {
            await mintingPointTimersManager.start(0);
            await catchInvalidOpcode(mintingPointTimersManager.start(0));
        });
        it("function reset should abort with an error if called consecutively", async function() {
            await mintingPointTimersManager.reset(0);
            await catchInvalidOpcode(mintingPointTimersManager.reset(0));
        });
    });

    describe("emulated assertion:", function() {
        it("timestamp.valid == false", async function() {
            assert.isFalse(await mintingPointTimersManager.running(0));
            assert.isFalse(await mintingPointTimersManager.expired(0));
        });
        it("timestamp.value >= current time - timeout", async function() {
            await mintingPointTimersManager.start(0);
            assert.isTrue (await mintingPointTimersManager.running(0));
            assert.isFalse(await mintingPointTimersManager.expired(0));
        });
        it("timestamp.value < current time - timeout", async function() {
            web3.currentProvider.send({method: "evm_increaseTime", params: [TIMEOUT + 1]});
            assert.isFalse(await mintingPointTimersManager.running(0));
            assert.isTrue (await mintingPointTimersManager.expired(0));
        });
    });

    describe("simulated assertion:", function() {
        before(async function() {
            mintingPointTimersManager = await artifacts.require("MintingPointTimersManagerExposure").new(contractAddressLocatorProxy.address, 0);
        });
        for (let timeout = 0; timeout < 10; timeout++) {
            for (let seconds = 0; seconds < 10; seconds++) {
                const expected_running = timeout >= seconds;
                const expected_expired = timeout <  seconds;
                it(`timeout = ${timeout}, seconds = ${seconds}`, async function() {
                    await mintingPointTimersManager.change(timeout);
                    await mintingPointTimersManager.start(0);
                    await mintingPointTimersManager.jump(seconds);
                    const actual_running = await mintingPointTimersManager.running(0);
                    const actual_expired = await mintingPointTimersManager.expired(0);
                    assert(actual_running == expected_running, `expected = ${expected_running}, actual = ${actual_running}`);
                    assert(actual_expired == expected_expired, `expected = ${expected_expired}, actual = ${actual_expired}`);
                    await mintingPointTimersManager.reset(0);
                });
            }
        }
    });
});
