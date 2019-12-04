contract("RedButtonUnitTest", function(accounts) {
    let redButton;

    const nonOwner = accounts[1];

    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        redButton = await artifacts.require("RedButton").new();
    });

    describe("security assertion:", function() {
        it("function setEnabled(true) should abort with an error if called by a non-owner", async function() {
            await catchRevert(redButton.setEnabled(true, {from: nonOwner}));
        });
        it("function setEnabled(false) should abort with an error if called by a non-owner", async function() {
            await catchRevert(redButton.setEnabled(false, {from: nonOwner}));
        });
    });

    describe("functionality assertion:", function() {
        it("function setEnabled(true)", async function() {
            const response = await redButton.setEnabled(true);
            assert.isTrue(await redButton.isEnabled());
            assert.equal(response.logs[0].event, "RedButtonEnabledSaved");
            assert.equal(response.logs[0].args._enabled , true);
        });
        it("function setEnabled(false)", async function() {
            const response = await redButton.setEnabled(false);
            assert.isFalse(await redButton.isEnabled());
            assert.equal(response.logs[0].event, "RedButtonEnabledSaved");
            assert.equal(response.logs[0].args._enabled , false);
        });
    });
});
