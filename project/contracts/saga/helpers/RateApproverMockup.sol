pragma solidity 0.4.25;

import "../interfaces/IRateApprover.sol";

contract RateApproverMockup is IRateApprover {
    bool isValid;

    function approveRate(uint256 _highRateN, uint256 _highRateD, uint256 _lowRateN, uint256 _lowRateD) external view returns (bool, string){
        _highRateN;
        _highRateD;
        _lowRateN;
        _lowRateD;
        if (isValid)
            return (true, "");
        else
            return (false, "some error messae");
    }

    function setIsValid(bool _isValid) external {
        isValid = _isValid;
    }
}
