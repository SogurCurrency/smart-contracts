pragma solidity 0.4.25;

import "./interfaces/IPriceBandCalculator.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Price Band Calculator.
 */
contract PriceBandCalculator is IPriceBandCalculator {
    string public constant VERSION = "1.0.1";

    using SafeMath for uint256;

    // Auto-generated via 'AutoGenerate/PriceBandCalculator/PrintConstants.py'
    uint256 public constant ONE = 1000000000;
    uint256 public constant GAMMA = 165000000000000000000000000000000000000000;
    uint256 public constant DELTA = 15000000;

    /**
     * Denote r = sdrAmount
     * Denote n = sgrTotal
     * Denote a = alpha / A_B_SCALE
     * Denote b = beta  / A_B_SCALE
     * Denote c = GAMMA / ONE / A_B_SCALE
     * Denote d = DELTA / ONE
     * Denote w = c / (a - b * n) - d
     * Return r / (1 + w)
     */
    function buy(uint256 _sdrAmount, uint256 _sgrTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        uint256 reserveRatio = calcReserveRatio(_alpha, _beta, _sgrTotal);
        return  (_sdrAmount.mul(reserveRatio).mul(ONE)).div((reserveRatio.mul(ONE.sub(DELTA))).add(GAMMA));
    }

    /**
     * Denote r = sdrAmount
     * Denote n = sgrTotal
     * Denote a = alpha / A_B_SCALE
     * Denote b = beta  / A_B_SCALE
     * Denote c = GAMMA / ONE / A_B_SCALE
     * Denote d = DELTA / ONE
     * Denote w = c / (a - b * n) - d
     * Return r * (1 - w)
     */
    function sell(uint256 _sdrAmount, uint256 _sgrTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        uint256 reserveRatio = calcReserveRatio(_alpha, _beta, _sgrTotal);
        return (_sdrAmount.mul((reserveRatio.mul(ONE.add(DELTA))).sub(GAMMA))).div(reserveRatio.mul(ONE));
    }

    function calcReserveRatio(uint256 _alpha, uint256 _beta, uint256 _sgrTotal) public pure returns (uint256){
        return _alpha.sub(_beta.mul(_sgrTotal));
    }
}
