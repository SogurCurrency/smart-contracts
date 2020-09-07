pragma solidity 0.4.25;

import "../interfaces/IIntervalIterator.sol";

contract IntervalIteratorMockup is IIntervalIterator {
    uint256 private index;
    uint256 private interval;
    uint256[2] private coefsReturnValues;
    bool private returnCoefsReturnValues;
    uint256 public constant A_B_SCALE = 10000000000000000000000000000000000;


    constructor(uint256 _interval) public {
        interval = _interval;
    }

    function setCoefsReturnValues(uint256 _a, uint256 _b) external {
        coefsReturnValues[0] = _a;
        coefsReturnValues[1] = _b;
        returnCoefsReturnValues = true;
    }

    function setIndex(uint256 _index) external {
        index = _index;
    }

    function getIndex() external view returns (uint256) {
        return index;
    }

    function grow() external {
        index++;
    }

    function shrink() external {
        index--;
    }

    function getCurrentInterval() external view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        uint256 min = interval * (index + 0);
        uint256 max = interval * (index + 1);
        return (min, max, min, max, A_B_SCALE, index);
    }

    function getCurrentIntervalCoefs() external view returns (uint256, uint256) {
        if (returnCoefsReturnValues)
            return (coefsReturnValues[0], coefsReturnValues[1]);
        return (A_B_SCALE, index);
    }
}
