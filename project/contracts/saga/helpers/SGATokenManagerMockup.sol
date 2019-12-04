pragma solidity 0.4.25;

import "../interfaces/ISGATokenManager.sol";

contract SGATokenManagerMockup is ISGATokenManager {
    function exchangeEthForSga(address _sender, uint256 _ethAmount) external returns (uint256) {
        _sender;
        return _ethAmount;
    }

    function exchangeSgaForEth(address _sender, uint256 _sgaAmount) external returns (uint256) {
        _sender;
        return _sgaAmount;
    }

    function uponTransfer(address _sender, address _to, uint256 _value) external {
        _sender;
        _to;
        _value;
    }

    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external {
        _sender;
        _from;
        _to;
        _value;
    }

    function uponDeposit(address _sender, uint256 _balance, uint256 _amount) external returns (address, uint256) {
        _amount;
        return (_sender, _balance);
    }

    function uponWithdraw(address _sender, uint256 _balance) external returns (address, uint256) {
        return (_sender, _balance);
    }

    function uponMintSgaForSgnHolders(uint256 _value) external {
        _value;
    }

    function uponTransferSgaToSgnHolder(address _to, uint256 _value) external {
        _to;
        _value;
    }

    function postTransferEthToSgaHolder(address _to, uint256 _value, bool _status) external {
        _to;
        _value;
        _status;
    }

    function getDepositParams() external view returns (address, uint256) {
        return (msg.sender, msg.sender.balance);
    }

    function getWithdrawParams() external view returns (address, uint256) {
        return (msg.sender, msg.sender.balance);
    }
}
