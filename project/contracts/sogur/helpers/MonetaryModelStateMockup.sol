pragma solidity 0.4.25;

import "../interfaces/IMonetaryModelState.sol";

contract MonetaryModelStateMockup is IMonetaryModelState {
    uint256 private sdrTotal;
    uint256 private sgrTotal;

    function init(uint256 _sdrTotal, uint256 _sgrTotal) external {
        sdrTotal = _sdrTotal;
        sgrTotal = _sgrTotal;
    }

    function setSdrTotal(uint256 _amount) external {
        sdrTotal = _amount;
    }

    function setSgrTotal(uint256 _amount) external {
        sgrTotal = _amount;
    }

    function getSdrTotal() external view returns (uint256) {
        return sdrTotal;
    }

    function getSgrTotal() external view returns (uint256) {
        return sgrTotal;
    }
}
