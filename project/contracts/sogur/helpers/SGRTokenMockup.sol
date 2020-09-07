pragma solidity 0.4.25;

contract SGRTokenMockup {
    address public sgaToSGRTokenExchangeAddress;
    uint256 public sgaToSGRTokenExchangeSGRSupply;

    function init(address _sgaToSGRTokenExchangeAddress, uint256 _sgaToSGRTokenExchangeSGRSupply) external {
        sgaToSGRTokenExchangeAddress = _sgaToSGRTokenExchangeAddress;
        sgaToSGRTokenExchangeSGRSupply = _sgaToSGRTokenExchangeSGRSupply;
    }
}