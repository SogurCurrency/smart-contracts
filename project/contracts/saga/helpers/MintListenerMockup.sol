pragma solidity 0.4.25;

import "../interfaces/IMintListener.sol";

contract MintListenerMockup is IMintListener {
    function mintSgaForSgnHolders(uint256 _value) external {
        _value;
    }
}
