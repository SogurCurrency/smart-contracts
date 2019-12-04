pragma solidity 0.4.25;

import "./interfaces/IPriceBandCalculator.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Price Band Calculator.
 */
contract PriceBandCalculator is IPriceBandCalculator {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    // Auto-generated via 'AutoGenerate/PriceBandCalculator/PrintConstants.py'
    uint256 public constant ONE     = 1000000000;
    uint256 public constant MIN_RR  = 1000000000000000000000000000000000;
    uint256 public constant MAX_RR  = 10000000000000000000000000000000000;
    uint256 public constant GAMMA   = 179437500000000000000000000000000000000000;
    uint256 public constant DELTA   = 29437500;
    uint256 public constant BUY_N   = 2000;
    uint256 public constant BUY_D   = 2003;
    uint256 public constant SELL_N  = 1997;
    uint256 public constant SELL_D  = 2000;
    uint256 public constant MAX_SDR = 500786938745138896681892746900;

    /**
     * Denote r = sdrAmount
     * Denote n = sgaTotal
     * Denote a = alpha / A_B_SCALE
     * Denote b = beta  / A_B_SCALE
     * Denote c = GAMMA / ONE / A_B_SCALE
     * Denote d = DELTA / ONE
     * Denote w = c / (a - b * n) - d
     * Return r / (1 + w)
     */
    function buy(uint256 _sdrAmount, uint256 _sgaTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        assert(_sdrAmount <= MAX_SDR);
        uint256 reserveRatio = _alpha.sub(_beta.mul(_sgaTotal));
        assert(MIN_RR <= reserveRatio && reserveRatio <= MAX_RR);
        uint256 variableFix = _sdrAmount * (reserveRatio * ONE) / (reserveRatio * (ONE - DELTA) + GAMMA);
        uint256 constantFix = _sdrAmount * BUY_N / BUY_D;
        return constantFix <= variableFix ? constantFix : variableFix;
    }

    /**
     * Denote r = sdrAmount
     * Denote n = sgaTotal
     * Denote a = alpha / A_B_SCALE
     * Denote b = beta  / A_B_SCALE
     * Denote c = GAMMA / ONE / A_B_SCALE
     * Denote d = DELTA / ONE
     * Denote w = c / (a - b * n) - d
     * Return r * (1 - w)
     */
    function sell(uint256 _sdrAmount, uint256 _sgaTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        assert(_sdrAmount <= MAX_SDR);
        uint256 reserveRatio = _alpha.sub(_beta.mul(_sgaTotal));
        assert(MIN_RR <= reserveRatio && reserveRatio <= MAX_RR);
        uint256 variableFix = _sdrAmount * (reserveRatio * (ONE + DELTA) - GAMMA) / (reserveRatio * ONE);
        uint256 constantFix = _sdrAmount * SELL_N / SELL_D;
        return constantFix <= variableFix ? constantFix : variableFix;
    }
}
