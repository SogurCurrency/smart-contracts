pragma solidity 0.4.25;

import "./interfaces/IRateApprover.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Rate Approver.
 */
contract RateApprover is IRateApprover, ContractAddressLocatorHolder, Claimable {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    /**
     * @dev rate maximum resolution.
     * @notice Allow for sufficiently-high resolution.
     * @notice Prevents multiplication-overflow.
     */
    uint256 public constant MAX_RESOLUTION = 0x10000000000000000;

    uint256 public sequenceNum = 0;
    uint256 public maxHighRateN = 0;
    uint256 public maxHighRateD = 0;
    uint256 public minLowRateN = 0;
    uint256 public minLowRateD = 0;

    event RateBoundsSaved(uint256 _maxHighRateN, uint256 _maxHighRateD, uint256 _minLowRateN, uint256 _minLowRateD);
    event RateBoundsNotSaved(uint256 _maxHighRateN, uint256 _maxHighRateD, uint256 _minLowRateN, uint256 _minLowRateD);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}


    /**
    * @dev throw if called setting rate bounds.
    */
    modifier onlyIfRateBoundsSet() {
        assert(maxHighRateN > 0 && maxHighRateD > 0 && minLowRateN > 0 && minLowRateD > 0);
        _;
    }


    /**
     * @dev Set high rate higher bound and low rate lower bound.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _maxHighRateN The numerator of the max high rate.
     * @param _maxHighRateD The denominator of the max high rate.
     * @param _minLowRateN The numerator of the min low rate.
     * @param _minLowRateD The denominator of the min low rate.
     */
    function setRateBounds(uint256 _sequenceNum, uint256 _maxHighRateN, uint256 _maxHighRateD, uint256 _minLowRateN, uint256 _minLowRateD) external onlyOwner {
        require(1 <= _maxHighRateN && _maxHighRateN <= MAX_RESOLUTION, "max high rate numerator is out of range");
        require(1 <= _maxHighRateD && _maxHighRateD <= MAX_RESOLUTION, "max high rate denominator is out of range");
        require(1 <= _minLowRateN && _minLowRateN <= MAX_RESOLUTION, "min low rate numerator is out of range");
        require(1 <= _minLowRateD && _minLowRateD <= MAX_RESOLUTION, "min low rate denominator is out of range");
        require(_maxHighRateN * _minLowRateD > _maxHighRateD * _minLowRateN, "max high rate is smaller than min low rate");
        //will never overflow (MAX_RESOLUTION = 2^64 )

        if (sequenceNum < _sequenceNum) {
            sequenceNum = _sequenceNum;
            maxHighRateN = _maxHighRateN;
            maxHighRateD = _maxHighRateD;
            minLowRateN = _minLowRateN;
            minLowRateD = _minLowRateD;

            emit RateBoundsSaved(_maxHighRateN, _maxHighRateD, _minLowRateN, _minLowRateD);
        }
        else {
            emit RateBoundsNotSaved(_maxHighRateN, _maxHighRateD, _minLowRateN, _minLowRateD);
        }
    }


    /**
     * @dev Approve high rate and low rate.
     * @param _highRateN The numerator of the high rate.
     * @param _highRateD The denominator of the high rate.
     * @param _lowRateN The numerator of the low rate.
     * @param _lowRateD The denominator of the low rate.
     * @return Success flag and error reason.
     */
    function approveRate(uint256 _highRateN, uint256 _highRateD, uint256 _lowRateN, uint256 _lowRateD) external view only(_IETHConverter_) onlyIfRateBoundsSet returns (bool, string){
        bool success = false;
        string memory reason;
        if (_highRateN.mul(_lowRateD) < _highRateD.mul(_lowRateN))
            reason = "high rate is smaller than low rate";
        else if (maxHighRateN.mul(_highRateD) < maxHighRateD.mul(_highRateN))
            reason = "high rate is higher than max high rate";
        else if (_lowRateN.mul(minLowRateD) < _lowRateD.mul(minLowRateN))
            reason = "low rate is lower than min low rate";
        else
            success = true;
        return (success, reason);
    }


}
