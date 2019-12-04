pragma solidity 0.4.25;
import "../interfaces/ITradingClasses.sol";


contract TradingClassesMockup is ITradingClasses {
    function getLimit(uint256 _id) external view returns (uint256) {
        _id;
        return 0;
    }
}
