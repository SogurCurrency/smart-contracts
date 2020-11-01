contract("ApprovalVotingUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgrAuthorizationManager;
    let approvalVoting;

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
        approvalVoting                 = await artifacts.require("ApprovalVoting"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber + 2, currentBlockNumber +10);

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
        await catchRevert(artifacts.require("ApprovalVoting"             ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber , currentBlockNumber + 10));
     });

     it("should fail if _startBlock is greater than _endBlock", async function() {
        await catchRevert(artifacts.require("ApprovalVoting"             ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+3, currentBlockNumber+2));
     });

     it("should fail if _startBlock and _endBlock are equal", async function() {
        await catchRevert(artifacts.require("ApprovalVoting"             ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber+2));
     });

     it("should fail if _description is empty", async function() {
        await catchRevert(artifacts.require("ApprovalVoting"             ).new(contractAddressLocatorProxy.address, "", currentBlockNumber+2, currentBlockNumber+10));
     });
   });

   describe("getAllVoters:", function() {
     it("should get all voters", async function() {
        await approvalVoting.voteAgainst({from: accounts[1]});
        await approvalVoting.voteFor({from: accounts[2]});
        await approvalVoting.voteAgainst({from: accounts[3]});
        await approvalVoting.voteFor({from: accounts[4]});

        let allVotes = await approvalVoting.getAllVoters();

        assert.deepEqual(allVotes, [accounts[1], accounts[2], accounts[3], accounts[4]]);
     });
   });

   describe("getTotalVoters:", function() {
     it("should get total voters length", async function() {
        await approvalVoting.voteAgainst({from: accounts[1]});
        await approvalVoting.voteFor({from: accounts[2]});
        await approvalVoting.voteAgainst({from: accounts[3]});
        await approvalVoting.voteFor({from: accounts[4]});

        assertEqual(await approvalVoting.getTotalVoters(), 4);
     });
   });

   describe("getVotersRange:", function() {
     it("should get voters by range", async function() {
        await approvalVoting.voteAgainst({from: accounts[1]});
        await approvalVoting.voteFor({from: accounts[2]});
        await approvalVoting.voteAgainst({from: accounts[3]});
        await approvalVoting.voteFor({from: accounts[4]});

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
          let votersByRange = await approvalVoting.getVotersRange(getVotersRangeTestValues[i].start_index,getVotersRangeTestValues[i].count);
          assert.deepEqual(votersByRange, getVotersRangeTestValues[i].expected);
        }
     });
   });

   describe("voteFor:", function() {
     it("should fail if not active", async function() {
        approvalVoting                 = await artifacts.require("ApprovalVoting"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber +3);
        await approvalVoting.voteFor();
        await approvalVoting.voteFor({from: accounts[2]});
        await catchRevert(approvalVoting.voteFor({from: accounts[3]}));
     });

     it("should fail if user already voted against", async function() {
        await approvalVoting.voteAgainst();
        await catchRevert(approvalVoting.voteFor());
     });
     it("should fail if user already voted for", async function() {
        await approvalVoting.voteFor();
        await catchRevert(approvalVoting.voteFor());
     });

     it("should fail if user not authorized", async function() {
        await sgrAuthorizationManager.setState(false);
        await catchRevert(approvalVoting.voteFor());
     });

     it("should succeed", async function() {
        const response = await approvalVoting.voteFor();
        assertEqual(await approvalVoting.votes.call(user), 1);
        assertEqual(await approvalVoting.voters.call(0), user);
        assert.equal(response.logs[0].args.voter.toString(), user.toString());
        assert.equal(response.logs[0].args.supports,true);
        assert.equal(response.logs[0].event, "VoteCasted");
     });
   });


   describe("voteAgainst:", function() {
     it("should fail if not active", async function() {

        approvalVoting                 = await artifacts.require("ApprovalVoting"              ).new(contractAddressLocatorProxy.address, VALID_DESCRIPTION, currentBlockNumber+2, currentBlockNumber +3);
        await approvalVoting.voteAgainst();
        await approvalVoting.voteAgainst({from: accounts[2]});
        await catchRevert(approvalVoting.voteAgainst({from: accounts[3]}));
     });

     it("should fail if user already voted against", async function() {
        await approvalVoting.voteAgainst();
        await catchRevert(approvalVoting.voteAgainst());
     });
     it("should fail if user already voted for", async function() {
        await approvalVoting.voteFor();
        await catchRevert(approvalVoting.voteAgainst());
     });

     it("should fail if user not authorized", async function() {
        await sgrAuthorizationManager.setState(false);
        await catchRevert(approvalVoting.voteAgainst());
     });

     it("should succeed", async function() {
        const response = await approvalVoting.voteAgainst();
        assertEqual(await approvalVoting.votes.call(user), 2);
        assertEqual(await approvalVoting.voters.call(0), user);

        assert.equal(response.logs[0].args.voter.toString(), user.toString());
        assert.equal(response.logs[0].args.supports,false);
        assert.equal(response.logs[0].event, "VoteCasted");
     });
   });

});
