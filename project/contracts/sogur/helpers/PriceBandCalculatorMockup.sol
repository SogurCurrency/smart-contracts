pragma solidity 0.4.25;

import "../interfaces/IPriceBandCalculator.sol";

contract PriceBandCalculatorMockup is IPriceBandCalculator {
    function buy(uint256 _sdrAmount, uint256 _sgrTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        _sgrTotal;
        _alpha;
        _beta;
        return _sdrAmount;
    }

    function sell(uint256 _sdrAmount, uint256 _sgrTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        _sgrTotal;
        _alpha;
        _beta;
        return _sdrAmount;
    }
}
