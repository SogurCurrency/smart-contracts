contract("AdminableUnitTest", function(accounts) {
    let adminable;

    const owner    = accounts[0];
    const nonOwner = accounts[1];
    const admin    = accounts[2];
    const nonAdmin = accounts[3];

    const nullAddress = require("../utilities.js").address(0);
    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        adminable = await artifacts.require("Adminable").new();
    });

    describe("security assertion:", function() {
        it("function accept should abort with an error if called by a non-owner", async function() {
            await catchRevert(adminable.accept(admin, {from: nonOwner}));
        });
        it("function accept should abort with an error if administrator is invalid", async function() {
            await catchRevert(adminable.accept(nullAddress, {from: owner}));
        });
        it("function accept should abort with an error if administrator already exists", async function() {
            await adminable.accept(admin, {from: owner});
            await catchRevert(adminable.accept(admin, {from: owner}));
        });
        it("function reject should abort with an error if called by a non-owner", async function() {
            await catchRevert(adminable.reject(admin, {from: nonOwner}));
        });
        it("function reject should abort with an error if administrator does not exist", async function() {
            await catchRevert(adminable.reject(nonAdmin, {from: owner}));
        });
        it("function reject should abort with an error if there are no more administrators", async function() {
            await adminable.reject(admin, {from: owner});
            await catchRevert(adminable.reject(admin, {from: owner}));
        });
    });

    describe("functionality assertion:", function() {
        it("function accept should accept the administrator", async function() {
            await test(adminable.accept, "AdminAccepted", admin, [admin]);
        });
        it("function reject should reject the administrator", async function() {
            await test(adminable.reject, "AdminRejected", admin, []);
        });
    });

    describe("data-structure management:", function() {
        it("reject first administrator until all administrators rejected", async function() {
            await rejectAllOneByOne(+1);
        });
        it("reject last administrator until all administrators rejected", async function() {
            await rejectAllOneByOne(-1);
        });
    });

    async function test(func, name, admin, admins) {
        const response   = await func(admin);
        const adminArray = await adminable.getAdminArray();
        const adminCount = await adminable.getAdminCount();
        const eventName  = response.logs[0].event;
        const eventData  = response.logs[0].args._admin;
        const expected   = `${name     }, ${admin    }, [${admins    }], ${admins.length}`;
        const actual     = `${eventName}, ${eventData}, [${adminArray}], ${adminCount   }`;
        assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
    }

    async function rejectAllOneByOne(direction) {
        console.log(`accepting ${accounts.length} administrators...`);
        for (const account of accounts)
            await adminable.accept(account);
        for (let admins = accounts.slice(); admins.length > 0; admins.length--) {
            const bgnIndex = (admins.length - 1) * (1 - direction) / 2;
            const endIndex = (admins.length - 1) * (1 + direction) / 2;
            const admin = await adminable.adminArray(bgnIndex);
            assert.equal(admin, admins[bgnIndex]);
            admins[bgnIndex] = admins[endIndex];
            await test(adminable.reject, "AdminRejected", admin, admins.slice(0, -1));
            console.log(`administrator ${bgnIndex} rejected`);
        }
    };
});
