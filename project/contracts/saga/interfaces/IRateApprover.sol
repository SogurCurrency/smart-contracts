pragma solidity 0.4.25;

/**
 * @title Rate Approver Interface.
 */
interface IRateApprover {
    /**
     * @dev Approve high rate.
     * @param _highRateN The numerator of the high rate.
     * @param _highRateD The denominator of the high rate.
     * @return Success flag.
     */
    function approveHighRate(uint256 _highRateN, uint256 _highRateD) external view  returns (bool);

    /**
    * @dev Approve low rate.
    * @param _lowRateN The numerator of the low rate.
    * @param _lowRateD The denominator of the low rate.
    * @return Success flag.
    */
    function approveLowRate(uint256 _lowRateN, uint256 _lowRateD) external view  returns (bool);
}