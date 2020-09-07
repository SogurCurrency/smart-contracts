pragma solidity 0.4.25;

import "../MintManager.sol";

contract MintManagerExposure is MintManager {
    constructor(IContractAddressLocator _contractAddressLocator) MintManager(_contractAddressLocator) public {}

    function setIndex(uint256 _index) external {
        index = _index;
    }
}
