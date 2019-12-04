pragma solidity 0.4.25;

import "../interfaces/IMintingPointTimersManager.sol";

contract MintingPointTimersManagerMockup is IMintingPointTimersManager {
    bool private isRunning;
    bool private isExpired;

    function start(uint256 _id) external {
        _id;
    }

    function reset(uint256 _id) external {
        _id;
    }

    function running(uint256 _id) external view returns (bool) {
        _id;
        return isRunning;
    }

    function expired(uint256 _id) external view returns (bool) {
        _id;
        return isExpired;
    }

    function setRunning(bool _state) external {
        isRunning = _state;
    }

    function setExpired(bool _state) external {
        isExpired = _state;
    }
}
