contract("BatchSetModelDataSourceUnitTest", function(accounts) {
    let modelDataSource;
    let batchSetModelDataSource;


    const owner = accounts[0];
    const nonOwner = accounts[1];

    const VALID_MAX_INTERVAL_INPUT_LENGTH = 32;

    const nullAddress        = require("../utilities.js").address(0);
    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    beforeEach(async function() {
        modelDataSource = await artifacts.require("ModelDataSource").new();
        batchSetModelDataSource = await artifacts.require("BatchSetModelDataSource").new(modelDataSource.address);

        await modelDataSource.transferOwnership(batchSetModelDataSource.address);
        await batchSetModelDataSource.claimOwnershipModelDataSource();
    });

    describe("constructor:", function() {
       it("should fail if model data source address is null", async function() {
          await catchRevert(artifacts.require("BatchSetModelDataSource"             ).new(nullAddress));
       });

       it("model data source should be set", async function() {
          assert(batchSetModelDataSource.modelDataSource.call(), modelDataSource.address);
       });

      it("max interval count should be valid", async function() {
          assert(batchSetModelDataSource.MAX_INTERVAL_INPUT_LENGTH.call(), VALID_MAX_INTERVAL_INPUT_LENGTH);
      });
    });

    describe("set intervals:", function() {
       it("function setInterval should abort with an error if called by a non-owner", async function() {
          await catchRevert(setValidIntervals(nonOwner));
       });

       it("should fail if model data source is locked", async function() {
          await batchSetModelDataSource.lockModelDataSource();
          await catchRevert(setValidIntervals(owner));
       });

       it("should fail if interval count is greater than max interval input length", async function() {
          await catchRevert( batchSetModelDataSource.setIntervals(VALID_MAX_INTERVAL_INPUT_LENGTH, [0], [0], [0], [1], [2], [3], [4], [5], {from: owner}));
       });

       it("should set valid interval", async function() {
          await setValidIntervals(owner);
       });

       it("should set valid intervals ", async function() {
          await batchSetModelDataSource.setIntervals(3, [0,0,2], [0, 1, 2], [0,6,12], [1,7,13], [2,8,14], [3,9,15], [4,10,16], [5,11,17], {from: owner});
          await validateIntervals([
             [0,0,0,1,2,3,4,5],
             [0,1,6,7,8,9,10,11],
             [2,2,12,13,14,15,16,17],
          ]);

       });

       it("should override intervals", async function() {
          await batchSetModelDataSource.setIntervals(2, [0,0], [0, 0], [0,6], [1,7], [2,8], [3,9], [4,10], [5,11], {from: owner});
          await validateIntervals([
             [0,0,6,7,8,9,10,11],
          ]);

          await batchSetModelDataSource.setIntervals(1, [0], [0], [20], [21], [22], [23], [24], [25], {from: owner});
          await validateIntervals([
             [0,0,20,21,22,23,24,25],
          ]);
       });
    });

    describe("lock:", function() {
       it("function lock should abort with an error if called by a non-owner", async function() {
          await catchRevert(batchSetModelDataSource.lockModelDataSource({from: nonOwner}));
       });

       it("should lock model data source", async function() {
          assert.isFalse(await modelDataSource.intervalListsLocked.call());
          await batchSetModelDataSource.lockModelDataSource();
          await catchRevert(setValidIntervals(owner));
          assert.isTrue(await modelDataSource.intervalListsLocked.call());
       });

    });

    describe("renounceOwnershipModelDataSource:", function() {
       it("should renounceOwnership for model data source", async function() {
          assert(await modelDataSource.owner.call() == batchSetModelDataSource.address);
          await batchSetModelDataSource.renounceOwnershipModelDataSource();
          assert(await modelDataSource.owner.call() == nullAddress);
       });
    });

    describe("claimOwnershipModelDataSource:", function() {
       it("should claimOwnership for model data source", async function() {
          modelDataSource = await artifacts.require("ModelDataSource").new();
          batchSetModelDataSource = await artifacts.require("BatchSetModelDataSource").new(modelDataSource.address);

          await modelDataSource.transferOwnership(batchSetModelDataSource.address);
          assert(await modelDataSource.pendingOwner.call() == batchSetModelDataSource.address, "not expected pending owner");

          await batchSetModelDataSource.claimOwnershipModelDataSource();
          assert(await modelDataSource.pendingOwner.call() == nullAddress);
          assert(await modelDataSource.owner.call() ==  batchSetModelDataSource.address);
       });
    });

    async function setValidIntervals (from) {
       await batchSetModelDataSource.setIntervals(1, [0], [0], [0], [0], [0], [0], [0], [0], {from: from});
    }

    async function validateIntervals (intervals) {
       for (i = 0; i < intervals.length; i++) {
           var [minN, maxN, minR, maxR, alpha, beta] = await modelDataSource.getInterval(intervals[i][0],intervals[i][1]);
           assertEqual(minN, intervals[i][2]);
           assertEqual(maxN, intervals[i][3]);
           assertEqual(minR, intervals[i][4]);
           assertEqual(maxR, intervals[i][5]);
           assertEqual(alpha, intervals[i][6]);
           assertEqual(beta, intervals[i][7]);
       }
    }

});
