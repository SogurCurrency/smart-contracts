contract("TradingClassesUnitTest", function(accounts) {
    let tradingClasses;

    const nonOwner = accounts[1];

    const Action = {None: 0, Insert: 1, Update: 2, Remove: 3};
    const catchRevert = require("../exceptions.js").catchRevert;

    const IDS    = [1, 2, 3, 4, 5, 6, 7, 8];
    const LIMITS = [0, 1, 1, 2, 2, 1, 1, 0];
    var limitValues = [
                {
                    'buyLimit': 0,
                    'sellLimit': 0,
                    'actionRole': 0,
                    'expectedAction': Action.None,
                },
                {
                    'buyLimit': 1,
                    'sellLimit': 0,
                    'actionRole': 0,
                    'expectedAction': Action.Insert,
                },
                {
                    'buyLimit': 1,
                    'sellLimit': 0,
                    'actionRole': 0,
                    'expectedAction': Action.None,
                },
                {
                    'buyLimit': 1,
                    'sellLimit': 1,
                    'actionRole': 0,
                    'expectedAction': Action.Update,
                },
                {
                    'buyLimit': 1,
                    'sellLimit': 1,
                    'actionRole': 1,
                    'expectedAction': Action.Update,
                },
                {
                    'buyLimit': 0,
                    'sellLimit': 1,
                    'actionRole': 1,
                    'expectedAction': Action.Update,
                },
                {
                    'buyLimit': 0,
                    'sellLimit': 1,
                    'actionRole': 1,
                    'expectedAction': Action.None,
                },
                {
                    'buyLimit': 0,
                    'sellLimit': 0,
                    'actionRole': 0,
                    'expectedAction': Action.Remove,
                },
                {
                    'buyLimit': 1,
                    'sellLimit': 0,
                    'actionRole': 0,
                    'expectedAction': Action.Insert,
                }
    ];



    before(async function() {
        tradingClasses = await artifacts.require("TradingClasses").new();
    });

    describe("security assertion:", function() {
        it("function setLimit should abort with an error if called by a non-owner", async function() {
            await catchRevert(tradingClasses.set(0, 0, 0, 0, {from: nonOwner}));
        });
    });

    describe("function getInfo:", function() {
        beforeEach(async function() {
            tradingClasses = await artifacts.require("TradingClasses").new();
        });

        it("should return the right info", async function() {
            expectedBuyLimit = 2;
            expectedSellLimit = 3;
            expectedActionRole = 4;
            await setTradingClassInfo(1, expectedActionRole, expectedBuyLimit, expectedSellLimit);

            let [actualBuyLimit, actualSellLimit, actualActionRole] = await tradingClasses.getInfo(1);
            assert.equal(expectedBuyLimit, actualBuyLimit);
            assert.equal(expectedSellLimit, actualSellLimit);
            assert.equal(expectedActionRole, actualActionRole);
        });
        it("should abort with an error if called with missing id", async function() {
            let [actualBuyLimit, actualSellLimit, actualActionRole] = await tradingClasses.getInfo(3);
            assert.equal(0, actualBuyLimit);
            assert.equal(0, actualSellLimit);
            assert.equal(0, actualActionRole);
        });
    });

    describe("function getActionRole:", function() {
        beforeEach(async function() {
            tradingClasses = await artifacts.require("TradingClasses").new();
        });

        it("should return the right action role", async function() {
            expectedActionRole = 4;
            await setTradingClassInfo(1, expectedActionRole, expectedBuyLimit, expectedSellLimit);

            let actualActionRole = await tradingClasses.getActionRole(1);
            assert.equal(expectedActionRole, actualActionRole);
        });

        it("should abort with an error if called with missing id", async function() {
            let actualActionRole = await tradingClasses.getActionRole(3);
            assert.equal(0, actualActionRole);
        });
    });

    describe("function getSellLimit:", function() {
        beforeEach(async function() {
            tradingClasses = await artifacts.require("TradingClasses").new();
        });

        it("should return the right sell limit", async function() {
            expectedSellLimit = 4;
            await setTradingClassInfo(1, expectedActionRole, expectedBuyLimit, expectedSellLimit);

            let actualSellLimit = await tradingClasses.getSellLimit(1);
            assert.equal(expectedSellLimit, actualSellLimit);
        });

        it("should abort with an error if called with missing id", async function() {
            let actualSellLimit = await tradingClasses.getSellLimit(3);
            assert.equal(0, actualSellLimit);
        });
    });

    describe("function getBuyLimit:", function() {
        beforeEach(async function() {
            tradingClasses = await artifacts.require("TradingClasses").new();
        });

        it("should return the right buy limit", async function() {
            expectedBuyLimit = 2;
            await setTradingClassInfo(1, expectedActionRole, expectedBuyLimit, expectedSellLimit);

            let actualBuyLimit = await tradingClasses.getBuyLimit(1);
            assert.equal(expectedBuyLimit, actualBuyLimit);
        });
        it("should abort with an error if called with missing id", async function() {
            let actualBuyLimit = await tradingClasses.getBuyLimit(3);
            assert.equal(0, actualBuyLimit);
        });
    });

    describe("functionality assertion:", function() {
        for (const id of IDS) {
             for (let j = 0; j < limitValues.length; j++) {
              const actionRole = limitValues[j].actionRole;
              const buyLimit = limitValues[j].buyLimit;
              const sellLimit = limitValues[j].sellLimit;
              const expectedAction = limitValues[j].expectedAction;

              it(`function setLimit(${id}, actionRole ${actionRole} buyLimit ${buyLimit} sellLimit ${sellLimit} expectedAction ${expectedAction})`, async function() {
                  const response = await setTradingClassInfo(id, actionRole, buyLimit, sellLimit);

                  const _event      = response.logs[0].event;
                  const _id         = response.logs[0].args._id;
                  const _actionRole = response.logs[0].args._actionRole;
                  const _buyLimit   = response.logs[0].args._buyLimit;
                  const _sellLimit  = response.logs[0].args._sellLimit;
                  const _action     = response.logs[0].args._action;
                  const expected    = `event: ActionCompleted, id: ${ id}, actionRole: ${actionRole}, buyLimit: ${buyLimit}, sellLimit: ${sellLimit}, action: ${ expectedAction}`;
                  const actual      = `event: ${_event      }, id: ${_id}, actionRole: ${_actionRole}, buyLimit: ${_buyLimit}, sellLimit: ${_sellLimit}, action: ${_action}`;
                  assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
              });
            }
        }
    });

    describe("data-structure management:", function() {
        it("remove first class until all classes removed", async function() {
            await removeAllOneByOne(+1);
        });
        it("remove last class until all classes removed", async function() {
            await removeAllOneByOne(-1);
        });
    });

    async function removeAllOneByOne(direction) {
        console.log(`inserting ${IDS.length} classes...`);
        for (const id of IDS)
            await setTradingClassInfo(id, 0, 0, 1);
        for (let ids = IDS.slice(); ids.length > 0; ids.length--) {
            const bgnIndex = (ids.length - 1) * (1 - direction) / 2;
            const endIndex = (ids.length - 1) * (1 + direction) / 2;
            const id = await tradingClasses.array(bgnIndex);
            assert.equal(id, ids[bgnIndex]);
            ids[bgnIndex] = ids[endIndex];
            await removeOne(id, ids.slice(0, -1));
            console.log(`class ${bgnIndex} removed`);
        }
    };

    async function removeOne(id, ids) {
        const response = await await setTradingClassInfo(id, 0, 0, 0);
        const array    = await tradingClasses.getArray();
        const count    = await tradingClasses.getCount();
        const expected = `array: ${ids  }, count: ${ids.length}`;
        const actual   = `array: ${array}, count: ${count     }`;
        assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
    }

    async function setTradingClassInfo(id, actionRole, buyLimit, sellLimit) {
       return await tradingClasses.set(id, actionRole, buyLimit, sellLimit);
    }

});
