contract("TradingClassesUnitTest", function(accounts) {
    let tradingClasses;

    const IDS    = [1, 2, 3, 4, 5, 6, 7, 8];
    const LIMITS = [0, 1, 1, 2, 2, 1, 1, 0];

    const nonOwner = accounts[1];

    const Action = {None: 0, Insert: 1, Update: 2, Remove: 3};

    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        tradingClasses = await artifacts.require("TradingClasses").new();
    });

    describe("security assertion:", function() {
        it("function setLimit should abort with an error if called by a non-owner", async function() {
            await catchRevert(tradingClasses.setLimit(0, 0, {from: nonOwner}));
        });
    });

    describe("functionality assertion:", function() {
        for (const id of IDS) {
            for (const limit of LIMITS) {
                it(`function setLimit(${id}, ${limit})`, async function() {
                    const previous = await tradingClasses.getLimit(id);
                    const response = await tradingClasses.setLimit(id, limit);
                    const action   = getAction(previous, limit);
                    const _event   = response.logs[0].event;
                    const _id      = response.logs[0].args._id;
                    const _limit   = response.logs[0].args._limit;
                    const _action  = response.logs[0].args._action;
                    const expected = `event: ActionCompleted, id: ${ id}, limit: ${ limit}, action: ${ action}`;
                    const actual   = `event: ${_event      }, id: ${_id}, limit: ${_limit}, action: ${_action}`;
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
            await tradingClasses.setLimit(id, 1);
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
        const response = await tradingClasses.setLimit(id, 0);
        const array    = await tradingClasses.getArray();
        const count    = await tradingClasses.getCount();
        const expected = `array: ${ids  }, count: ${ids.length}`;
        const actual   = `array: ${array}, count: ${count     }`;
        assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
    }

    function getAction(prev, next) {
        if (prev == 0 && next != 0)
            return Action.Insert;
        if (prev != 0 && next == 0)
            return Action.Remove;
        if (prev != next)
            return Action.Update;
        return Action.None;
    }
});
