pragma solidity 0.4.25;

import "../interfaces/IETHConverter.sol";

contract ETHConverterMockup is IETHConverter {
    function toSdrAmount(uint256 _ethAmount) external view returns (uint256) {
        return _ethAmount;
    }

    function toEthAmount(uint256 _sdrAmount) external view returns (uint256) {
        return _sdrAmount;
    }

    function fromEthAmount(uint256 _ethAmount) external view returns (uint256) {
        return _ethAmount;
    }
}
