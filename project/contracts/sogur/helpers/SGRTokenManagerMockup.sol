pragma solidity 0.4.25;

import "../interfaces/ISGRTokenManager.sol";

contract SGRTokenManagerMockup is ISGRTokenManager {
    address public sender;
    address public to;
    address public from;
    address public wallet;
    uint256 public value;
    uint256 public sgrAmount;
    uint256 public ethAmount;

    uint256 public amount;
    uint256 public priorWithdrawEthBalance;
    uint256 public afterWithdrawEthBalance;

    bool public boolResult;

    function exchangeEthForSgr(address _sender, uint256 _ethAmount) external returns (uint256) {
        _sender;
        return _ethAmount;
    }

    function afterExchangeEthForSgr(address _sender, uint256 _ethAmount, uint256 _sgrAmount) external {
        sender = _sender;
        ethAmount = _ethAmount;
        sgrAmount = _sgrAmount;
    }

    function exchangeSgrForEth(address _sender, uint256 _sgrAmount) external returns (uint256) {
        _sender;
        return _sgrAmount;
    }

    function afterExchangeSgrForEth(address _sender, uint256 _sgrAmount, uint256 _ethAmount) external returns (bool){
        sender = _sender;
        ethAmount = _ethAmount;
        sgrAmount = _sgrAmount;
        return true;
    }

    function uponTransfer(address _sender, address _to, uint256 _value) external {
        _sender;
        _to;
        _value;
    }

    function afterTransfer(address _sender, address _to, uint256 _value, bool _transferResult) external returns (bool){
        sender = _sender;
        to = _to;
        value = _value;
        boolResult = _transferResult;
        return _transferResult;
    }

    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external {
        _sender;
        _from;
        _to;
        _value;
    }

    function afterTransferFrom(address _sender, address _from, address _to, uint256 _value, bool _transferFromResult) external returns (bool){
        sender = _sender;
        from = _from;
        to = _to;
        value = _value;
        boolResult = _transferFromResult;
        return _transferFromResult;
    }

    function uponDeposit(address _sender, uint256 _balance, uint256 _amount) external returns (address, uint256) {
        _amount;
        return (_sender, _balance);
    }

    function uponWithdraw(address _sender, uint256 _balance) external returns (address, uint256) {
        return (_sender, _balance);
    }

    function afterWithdraw(address _sender, address _wallet, uint256 _amount, uint256 _priorWithdrawEthBalance, uint256 _afterWithdrawEthBalance) external {
        sender = _sender;
        wallet = _wallet;
        amount = _amount;
        priorWithdrawEthBalance = _priorWithdrawEthBalance;
        afterWithdrawEthBalance = _afterWithdrawEthBalance;
    }


    function uponMintSgrForSgnHolders(uint256 _value) external {
        _value;
    }

    function afterMintSgrForSgnHolders(uint256 _value) external {
        value = _value;
    }

    function uponTransferSgrToSgnHolder(address _to, uint256 _value) external {
        _to;
        _value;
    }

    function afterTransferSgrToSgnHolder(address _to, uint256 _value) external{
        to = _to;
        value = _value;
    }

    function postTransferEthToSgrHolder(address _to, uint256 _value, bool _status) external {
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
