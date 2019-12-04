pragma solidity 0.4.25;

import "./interfaces/IReconciliationAdjuster.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Reconciliation Adjuster.
 */
contract ReconciliationAdjuster is IReconciliationAdjuster, Claimable {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    /**
     * @dev SDR adjustment factor maximum resolution.
     * @notice Allow for sufficiently-high resolution.
     * @notice Prevents multiplication-overflow.
     */
    uint256 public constant MAX_RESOLUTION = 0x10000000000000000;

    uint256 public sequenceNum = 0;
    uint256 public factorN = 0;
    uint256 public factorD = 0;

    event FactorSaved(uint256 _factorN, uint256 _factorD);
    event FactorNotSaved(uint256 _factorN, uint256 _factorD);

    /**
    * @dev throw if called before factor set.
    */
    modifier onlyIfFactorSet() {
        assert(factorN > 0 && factorD > 0);
        _;
    }

    /**
     * @dev Set the SDR adjustment factor.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _factorN The numerator of the SDR adjustment factor.
     * @param _factorD The denominator of the SDR adjustment factor.
     */
    function setFactor(uint256 _sequenceNum, uint256 _factorN, uint256 _factorD) external onlyOwner {
        require(1 <= _factorN && _factorN <= MAX_RESOLUTION, "adjustment factor numerator is out of range");
        require(1 <= _factorD && _factorD <= MAX_RESOLUTION, "adjustment factor denominator is out of range");

        if (sequenceNum < _sequenceNum) {
            sequenceNum = _sequenceNum;
            factorN = _factorN;
            factorD = _factorD;
            emit FactorSaved(_factorN, _factorD);
        }
        else {
            emit FactorNotSaved(_factorN, _factorD);
        }
    }

    /**
     * @dev Get the buy-adjusted value of a given SDR amount.
     * @param _sdrAmount The amount of SDR to adjust.
     * @return The adjusted amount of SDR.
     */
    function adjustBuy(uint256 _sdrAmount) external view onlyIfFactorSet returns (uint256) {
        return _sdrAmount.mul(factorD) / factorN;
    }

    /**
     * @dev Get the sell-adjusted value of a given SDR amount.
     * @param _sdrAmount The amount of SDR to adjust.
     * @return The adjusted amount of SDR.
     */
    function adjustSell(uint256 _sdrAmount) external view onlyIfFactorSet returns (uint256) {
        return _sdrAmount.mul(factorN) / factorD;
    }
}
