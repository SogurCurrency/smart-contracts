pragma solidity 0.4.25;

import "../interfaces/IRateApprover.sol";

contract RateApproverMockup is IRateApprover {
    bool isHighRateValid;
    bool isLowRateValid;

    function approveHighRate(uint256 _highRateN, uint256 _highRateD) external view  returns (bool) {
        _highRateN;
        _highRateD;
        if (isHighRateValid)
            return true;
        else
            return false;
    }

    function approveLowRate(uint256 _lowRateN, uint256 _lowRateD) external view  returns (bool){
        _lowRateN;
        _lowRateD;
        if (isLowRateValid)
            return true;
        else
            return false;
    }

    function setIsHighRateValid(bool _isValid) external {
        isHighRateValid = _isValid;
    }

    function setIsLowRateValid(bool _isValid) external {
        isLowRateValid = _isValid;
    }
}
