pragma solidity 0.4.25;

import "../MintingPointTimersManager.sol";

contract MintingPointTimersManagerExposure is MintingPointTimersManager {
    uint256 private epoch;

    constructor(IContractAddressLocator _contractAddressLocator, uint256 _timeout) MintingPointTimersManager(_contractAddressLocator, _timeout) public {}

    function jump(uint256 _seconds) external {
        epoch += _seconds;
    }

    function change(uint256 _timeout) external {
        timeout = _timeout;
    }

    function time() internal view returns (uint256) {
        return epoch;
    }
}
