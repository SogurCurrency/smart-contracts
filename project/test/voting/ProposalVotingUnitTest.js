contract("ProposalVotingUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgrAuthorizationManager;
    let proposalVotingExposure;

    let currentBlockNumber;

    const VALID_DESCRIPTION = "some valid description";

    const user = accounts[0];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    beforeEach(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        sgrAuthorizationManager          = await artifacts.require("SGRAuthorizationManagerMockup"         ).new();
        await sgrAuthorizationManager.setState(true);
        await contractAddressLocatorProxy.set("ISGRAuthorizationManager", sgrAuthorizationManager.address);

        currentBlockNumber = await getCurrentBlockNumber();
        proposalVotingExposure                 = await artifacts.require("ProposalVotingExposure"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber + 2, currentBlockNumber +10, 4);

        currentBlockNumber = currentBlockNumber + 1;
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getCurrentBlockNumber() {
        let result = 0;
        web3.eth.getBlockNumber(function(err, num) { if (err === null) {result = num}})
        await sleep(200);
        if (result == 0)
           throw 'fail to get current block number';
        return result;
    }
    describe("constructor:", function() {
     it("should fail if _startBlock is lower than current block", async function() {
        await catchRevert(artifacts.require("ProposalVotingExposure"             ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber , currentBlockNumber + 10, 4));
     });

     it("should fail if _startBlock is greater than _endBlock", async function() {
        await catchRevert(artifacts.require("ProposalVotingExposure"             ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+3, currentBlockNumber+2, 4));
     });

     it("should fail if _startBlock and _endBlock are equal", async function() {
        await catchRevert(artifacts.require("ProposalVotingExposure"             ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber+2, 4));
     });

     it("should fail if _description is empty", async function() {
        await catchRevert(artifacts.require("ProposalVotingExposure"             ).new(contractAddressLocatorProxy.address, "", currentBlockNumber+2, currentBlockNumber+10, 4));
     });

      it("should set correct choice size", async function() {
             proposalVotingExposure = await artifacts.require("ProposalVotingExposure"             ).new(contractAddressLocatorProxy.address, "some desc", currentBlockNumber+40, currentBlockNumber+60, 4);
             assertEqual(await proposalVotingExposure.choicesCount.call(),4);
             proposalVotingExposure = await artifacts.require("ProposalVotingExposure"             ).new(contractAddressLocatorProxy.address, "some desc", currentBlockNumber+50, currentBlockNumber+70, 2);
             assertEqual(await proposalVotingExposure.choicesCount.call(),2);
             await catchRevert(artifacts.require("ProposalVotingExposure"             ).new(contractAddressLocatorProxy.address, "some desc", currentBlockNumber+50, currentBlockNumber+70, 5));
      });
   });

   describe("getAllVoters:", function() {
     it("should get all voters", async function() {
        proposalVotingExposure            = await artifacts.require("ProposalVotingExposure"         ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber + 2, currentBlockNumber +10, 2);
        await proposalVotingExposure.callCastVote(0,{from: accounts[1]});
        await proposalVotingExposure.callCastVote(1,{from: accounts[2]});
        await proposalVotingExposure.callCastVote(0, {from: accounts[3]});
        await proposalVotingExposure.callCastVote(1, {from: accounts[4]});

        let allVotes = await proposalVotingExposure.getAllVoters();

        assert.deepEqual(allVotes, [accounts[1], accounts[2], accounts[3], accounts[4]]);
     });
   });

   describe("getTotalVoters:", function() {
     it("should get total voters length", async function() {
     proposalVotingExposure            = await artifacts.require("ProposalVotingExposure"         ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber + 2, currentBlockNumber +10, 2);
        await proposalVotingExposure.callCastVote(0, {from: accounts[1]});
        await proposalVotingExposure.callCastVote(1, {from: accounts[2]});
        await proposalVotingExposure.callCastVote(1, {from: accounts[3]});
        await proposalVotingExposure.callCastVote(0, {from: accounts[4]});

        assertEqual(await proposalVotingExposure.getTotalVoters(), 4);
     });
   });

   describe("getVotersRange:", function() {
     it("should get voters by range", async function() {
        proposalVotingExposure            = await artifacts.require("ProposalVotingExposure"         ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber + 2, currentBlockNumber +10, 2);
        await proposalVotingExposure.callCastVote(1,{from: accounts[1]});
        await proposalVotingExposure.callCastVote(0,{from: accounts[2]});
        await proposalVotingExposure.callCastVote(1,{from: accounts[3]});
        await proposalVotingExposure.callCastVote(0,{from: accounts[4]});

        const getVotersRangeTestValues = [
        {
            'start_index' : 0,
            'count' : 0,
            'expected': []
        },
        {
            'start_index' : 1,
            'count' : 0,
            'expected': []
        },
        {
            'start_index' : 0,
            'count' : 1,
            'expected': [accounts[1]]
        },
        {
            'start_index' : 1,
            'count' : 1,
            'expected': [accounts[2]]
        },
        {
            'start_index' : 3,
            'count' : 1,
            'expected': [accounts[4]]
        },
        {
            'start_index' : 3,
            'count' : 5,
            'expected': [accounts[4]]
        },
        {
            'start_index' : 0,
            'count' : 3,
            'expected': [accounts[1], accounts[2], accounts[3]]
        },
        {
            'start_index' : 0,
            'count' : 4,
            'expected': [accounts[1], accounts[2], accounts[3], accounts[4]]
        },
        {
            'start_index' : 0,
            'count' : 5,
            'expected': [accounts[1], accounts[2], accounts[3], accounts[4]]
        },
        {
            'start_index' : 0,
            'count' : 20,
            'expected': [accounts[1], accounts[2], accounts[3], accounts[4]]
        }
        ];

        for (let i = 0; i < getVotersRangeTestValues.length; i++) {
          let votersByRange = await proposalVotingExposure.getVotersRange(getVotersRangeTestValues[i].start_index,getVotersRangeTestValues[i].count);
          assert.deepEqual(votersByRange, getVotersRangeTestValues[i].expected);
        }
     });
   });

   describe("castVote:", function() {
     it("should fail if not active", async function() {
        proposalVotingExposure                 = await artifacts.require("ProposalVotingExposure"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber +3, 1);
        await proposalVotingExposure.callCastVote(0);
        await proposalVotingExposure.callCastVote(0,{from: accounts[2]});
        assert.equal(await proposalVotingExposure.isActive(),false);
        await catchRevert(proposalVotingExposure.callCastVote(0,{from: accounts[3]}));
     });

     it("should fail if voting with invalid index", async function() {
        proposalVotingExposure                 = await artifacts.require("ProposalVotingExposure"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber +50, 0);
        assert.equal(await proposalVotingExposure.isActive(),true);
        await catchRevert(proposalVotingExposure.callCastVote(0));
     });

     it("should fail if voting with invalid index count 1", async function() {
        proposalVotingExposure = await artifacts.require("ProposalVotingExposure"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber +50, 1);
        assert.equal(await proposalVotingExposure.isActive(),true);
        await catchRevert(proposalVotingExposure.callCastVote(1));
     });

     it("should fail to start voting with more then 4 choices", async function() {
        await catchRevert(artifacts.require("ProposalVotingExposure"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber +50, 5));
     });

     it("should fail if user already voted against", async function() {
        await proposalVotingExposure.callCastVote(1);
        await catchRevert(proposalVotingExposure.callCastVote(0));
     });

     it("should fail if user already voted for", async function() {
        await proposalVotingExposure.callCastVote(0);
        await catchRevert(proposalVotingExposure.callCastVote(0));
     });

     it("should fail if user not authorized", async function() {
        await sgrAuthorizationManager.setState(false);
        await catchRevert(proposalVotingExposure.callCastVote(0));
     });

     it("should succeed", async function() {
        const response = await proposalVotingExposure.callCastVote(0);
        assertEqual(await proposalVotingExposure.votes.call(user), 1);
        assertEqual(await proposalVotingExposure.voters.call(0), user);
        assert.equal(response.logs[0].args.voter.toString(), user.toString());
        assert.equal(response.logs[0].args.choice,1);
        assert.equal(response.logs[0].event, "ProposalVoteCasted");
     });
   });



});
