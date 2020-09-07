pragma solidity 0.4.25;

contract ERC20Mockup  {
    address public transferCalledWithTo;
    uint256 public transferCalledWithValue;

    address public transferFromCalledWithFrom;
    address public transferFromCalledWithTo;
    uint256 public transferFromCalledWithValue;

    uint256 public balance;
    uint256 public allowance;

    uint public _totalSupply;

    function setBalance(uint256 _balance) external {
        balance = _balance;
    }
    function setAllowance(uint256 _allowance) external {
        allowance = _allowance;
    }

    function setTotalSupply(uint256 amount) external {
        _totalSupply = amount;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address who) external view returns (uint256){
        who;
        return balance;
    }

    function allowance(address owner, address spender) external view returns (uint256){
        owner;
        spender;
        return allowance;
    }

    function transfer(address _to, uint256 _value) external returns (bool) {
        transferCalledWithTo = _to;
        transferCalledWithValue = _value;
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool){
        transferFromCalledWithFrom = _from;
        transferFromCalledWithTo = _to;
        transferFromCalledWithValue = _value;
        return true;
    }
}
