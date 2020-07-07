pragma solidity 0.4.25;

import "./interfaces/IRateApprover.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";
import "@chainlink/contracts/src/v0.4/interfaces/AggregatorInterface.sol";
/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Oracle Rate Approver.
 */
contract OracleRateApprover is IRateApprover, ContractAddressLocatorHolder, Claimable {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    uint256 public constant MILLION = 1000000;
    uint256 public constant ORACLE_RATE_PRECISION = 100000000;

    uint256 public rateDeviationThreshold = 0;
    bool public isApproveAllRates = false;
    AggregatorInterface public oracleRateAggregator;

    uint256 public oracleRateAggregatorSequenceNum = 0;
    uint256 public rateDeviationThresholdSequenceNum = 0;
    uint256 public isApproveAllRatesSequenceNum = 0;


    event OracleRateAggregatorSaved(address _oracleRateAggregatorAddress);
    event OracleRateAggregatorNotSaved(address _oracleRateAggregatorAddress);
    event RateDeviationThresholdSaved(uint256 _rateDeviationThreshold);
    event RateDeviationThresholdNotSaved(uint256 _rateDeviationThreshold);
    event ApproveAllRatesSaved(bool _isApproveAllRates);
    event ApproveAllRatesNotSaved(bool _isApproveAllRates);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     * @param _oracleRateAggregatorAddress The address of the ETH SDR aggregator.
     * @param _rateDeviationThreshold The deviation threshold.
     */
    constructor(IContractAddressLocator _contractAddressLocator, address _oracleRateAggregatorAddress, uint256 _rateDeviationThreshold) ContractAddressLocatorHolder(_contractAddressLocator) public {
        setOracleRateAggregator(1, _oracleRateAggregatorAddress);
        setRateDeviationThreshold(1, _rateDeviationThreshold);
    }

    /**
     * @dev Set oracle rate aggregator.
     * @param _oracleRateAggregatorSequenceNum The sequence-number of the operation.
     * @param _oracleRateAggregatorAddress The address of the oracle rate aggregator.
     */
    function setOracleRateAggregator(uint256 _oracleRateAggregatorSequenceNum, address _oracleRateAggregatorAddress) public onlyOwner() {
        require(_oracleRateAggregatorAddress != address(0), "invalid _oracleRateAggregatorAddress");
        if (oracleRateAggregatorSequenceNum < _oracleRateAggregatorSequenceNum) {
            oracleRateAggregatorSequenceNum = _oracleRateAggregatorSequenceNum;
            oracleRateAggregator = AggregatorInterface(_oracleRateAggregatorAddress);
            emit OracleRateAggregatorSaved(_oracleRateAggregatorAddress);
        }
        else {
            emit OracleRateAggregatorNotSaved(_oracleRateAggregatorAddress);
        }
    }


    /**
     * @dev Set rate deviation threshold.
     * @param _rateDeviationThresholdSequenceNum The sequence-number of the operation.
     * @param _rateDeviationThreshold The deviation threshold, given in parts per million.
     */
    function setRateDeviationThreshold(uint256 _rateDeviationThresholdSequenceNum, uint256 _rateDeviationThreshold) public onlyOwner {
        require(_rateDeviationThreshold < MILLION, "_rateDeviationThreshold  is out of range");
        if (rateDeviationThresholdSequenceNum < _rateDeviationThresholdSequenceNum) {
            rateDeviationThresholdSequenceNum = _rateDeviationThresholdSequenceNum;
            rateDeviationThreshold = _rateDeviationThreshold;
            emit RateDeviationThresholdSaved(_rateDeviationThreshold);
        }
        else {
            emit RateDeviationThresholdNotSaved(_rateDeviationThreshold);
        }
    }


    /**
    * @dev Set is approve all rates.
    * @param _isApproveAllRatesSequenceNum The sequence-number of the operation.
    * @param _isApproveAllRates Approve all rates.
    */
    function setIsApproveAllRates(uint256 _isApproveAllRatesSequenceNum, bool _isApproveAllRates) public onlyOwner {
        if (isApproveAllRatesSequenceNum < _isApproveAllRatesSequenceNum) {
            isApproveAllRatesSequenceNum = _isApproveAllRatesSequenceNum;
            isApproveAllRates = _isApproveAllRates;
            emit ApproveAllRatesSaved(_isApproveAllRates);
        }
        else {
            emit ApproveAllRatesNotSaved(_isApproveAllRates);
        }
    }


    /**
     * @dev Approve high rate.
     * @param _highRateN The numerator of the high rate.
     * @param _highRateD The denominator of the high rate.
     * @return Success flag.
     */
    function approveHighRate(uint256 _highRateN, uint256 _highRateD) external view only(_IETHConverter_) returns (bool){
        return approveRate(_highRateN, _highRateD);
    }

    /**
     * @dev Approve low rate.
     * @param _lowRateN The numerator of the low rate.
     * @param _lowRateD The denominator of the low rate.
     * @return Success flag.
     */
    function approveLowRate(uint256 _lowRateN, uint256 _lowRateD) external view only(_IETHConverter_) returns (bool){
        return approveRate(_lowRateN, _lowRateD);
    }

    /**
     * @notice Checks if given rate is close to OracleLatestRate up to rateDeviationThreshold/MILLION, using the inequality:
     * OracleLatestRate/ORACLE_RATE_PRECISION*(1-rateDeviationThreshold/MILLION) < rate_N/rate_D < OracleLatestRate/ORACLE_RATE_PRECISION*(1 + rateDeviationThreshold/MILLION)
     * to avoid underflow this can be written as: B-C  > rate >  B+C, with:
     * rate = rate_N*ORACLE_RATE_PRECISION*MILLION
     * A = OracleLatestRate*rateD
     * B = A*MILLION
     * C = A*rateDeviationThreshold
     * will never overflow for the allowed range of values for each variable
     * @dev Approve rate.
     * @param _rateN The numerator of the rate.
     * @param _rateD The denominator of the rate.
     * @return Success flag.
     */
    function approveRate(uint256 _rateN, uint256 _rateD) internal view returns (bool) {
        assert(_rateN > 0);
        assert(_rateD > 0);
        bool success = true;

        if (!isApproveAllRates) {
            uint256 A = (getOracleLatestRate()).mul(_rateD);
            uint256 B = A.mul(MILLION);
            uint256 C = A.mul(rateDeviationThreshold);
            uint256 rate = (_rateN.mul(ORACLE_RATE_PRECISION)).mul(MILLION);

            if (rate > B.add(C)) {
                success = false;
            }
            else if (rate < B.sub(C)) {
                success = false;
            }
        }

        return success;
    }

    /**
    * @dev Get the oracle latest rate.
    * @return The oracle latest rate.
    */
    function getOracleLatestRate() internal view returns (uint256) {
        int256 latestAnswer = oracleRateAggregator.latestAnswer();
        assert(latestAnswer > 0);
        return uint256(latestAnswer);
    }
}
