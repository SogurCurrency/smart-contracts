pragma solidity 0.4.25;

import "../interfaces/IReconciliationAdjuster.sol";

contract ReconciliationAdjusterMockup is IReconciliationAdjuster {
    function adjustBuy(uint256 _sdrAmount) external view returns (uint256) {
        return _sdrAmount;
    }

    function adjustSell(uint256 _sdrAmount) external view returns (uint256) {
        return _sdrAmount;
    }
}
