pragma solidity 0.4.25;

import "../interfaces/IIntervalIterator.sol";

contract IntervalIteratorMockup is IIntervalIterator {
    uint256 private index;
    uint256 private interval;

    constructor(uint256 _interval) public {
        interval = _interval;
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
        return (min, max, min, max, index, index);
    }

    function getCurrentIntervalCoefs() external view returns (uint256, uint256) {
        return (index, index);
    }
}
