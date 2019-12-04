pragma solidity 0.4.25;

import "../IntervalIterator.sol";

contract IntervalIteratorExposure is IntervalIterator {
    constructor(IContractAddressLocator _contractAddressLocator) IntervalIterator(_contractAddressLocator) public {}

    function setState(uint256 _row, uint256 _col) external {
        row = _row;
        col = _col;
    }
}
