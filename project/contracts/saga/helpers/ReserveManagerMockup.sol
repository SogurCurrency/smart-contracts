pragma solidity 0.4.25;

import "../interfaces/IReserveManager.sol";

contract ReserveManagerMockup is IReserveManager {
    address private wallet;
    uint256 private amount;

    function setState(address _wallet, uint256 _amount) external {
        wallet = _wallet;
        amount = _amount;
    }

    function getDepositParams(uint256 _balance) external view returns (address, uint256) {
        _balance;
        return (wallet, amount);
    }

    function getWithdrawParams(uint256 _balance) external view returns (address, uint256) {
        _balance;
        return (wallet, amount);
    }
}
