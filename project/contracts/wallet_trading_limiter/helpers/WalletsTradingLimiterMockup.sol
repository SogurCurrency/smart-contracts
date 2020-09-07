pragma solidity 0.4.25;

import "../interfaces/IWalletsTradingLimiter.sol";


contract WalletsTradingLimiterMockup is IWalletsTradingLimiter {
    bool private pass;

    constructor() public {
      pass = true;
    }

    function setPass(bool _pass) external {
        pass = _pass;
    }

    function updateWallet(address _wallet, uint256 _value) external {
        _wallet;
        _value;
        require(pass);
    }
}
