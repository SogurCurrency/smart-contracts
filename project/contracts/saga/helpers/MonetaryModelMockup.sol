pragma solidity 0.4.25;

import "../interfaces/IMonetaryModel.sol";

contract MonetaryModelMockup is IMonetaryModel {
    function buy(uint256 _sdrAmount) external returns (uint256) {
        return _sdrAmount;
    }

    function sell(uint256 _sgaAmount) external returns (uint256) {
        return _sgaAmount;
    }
}
