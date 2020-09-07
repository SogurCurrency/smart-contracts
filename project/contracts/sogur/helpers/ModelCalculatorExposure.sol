pragma solidity 0.4.25;

import "../ModelCalculator.sol";

contract ModelCalculatorExposure is ModelCalculator {
    function logFunc(uint256 _x) external pure returns (uint256) {
        return super.log(_x);
    }

    function expFunc(uint256 _x) external pure returns (uint256) {
        return super.exp(_x);
    }
}
