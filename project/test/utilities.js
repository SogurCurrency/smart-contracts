module.exports.address = function(integer) {
    return "0x" + integer.toString(16).padStart(40, "0");
};

module.exports.createAddresses = function(startIncrementalId, count) {
    let addresses = [];
    for (let i = 0; i < count ; i++) {
      addresses[i] = "0x" + startIncrementalId.toString(16).padStart(40, "0");
      startIncrementalId++;
    }
    return addresses;
};

module.exports.unzip = function(tuples) {
    return [tuples.map(x => web3.fromAscii(x[0])), tuples.map(x => x[1])];
};

module.exports.decode = function(response, contract, index, params) {
    let event = {};
    let index1 = 1;
    let index2 = 2;
    const log = response.receipt.logs.filter(log => log.address == contract.address)[index];
    for (const param of params) {
        if (param.indexed) {
            event[param.name] = "0x" + log.topics[index1].slice(66 - param.size / 4);
            index1 += 1;
        }
        else {
            event[param.name] = "0x" + log.data.substr(index2, index2 + param.size / 4);
            index2 += param.size / 4;
        }
    }
    return event;
};

module.exports.assertEqual = async function(promise, value) {
    const actual = await promise;
    const expected = web3.toBigNumber(value);
    assert.equal(actual.toFixed(), expected.toFixed());
};
