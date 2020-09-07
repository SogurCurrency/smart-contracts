pragma solidity 0.4.25;

import "../interfaces/IMintManager.sol";

contract MintManagerMockup is IMintManager {
    uint256 private index;

    function setIndex(uint256 _index) external {
        index = _index;
    }

    function getIndex() external view returns (uint256) {
        return index;
    }
}
