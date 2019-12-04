pragma solidity 0.4.25;

import "../../saga-genesis/interfaces/IMintHandler.sol";

contract MintHandlerMockup is IMintHandler {
    function mintSgnVestedInDelay(uint256 _value) external {
        _value;
    }
}
