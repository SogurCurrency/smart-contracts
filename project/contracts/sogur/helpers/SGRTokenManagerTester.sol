pragma solidity 0.4.25;
import "../SGRTokenManager.sol";


contract SGRTokenManagerTester  {

    SGRTokenManager sgrTokenManager;
    bool public boolResult;

    constructor(address _sgrTokenManagerAddress)public {
        sgrTokenManager = SGRTokenManager(_sgrTokenManagerAddress);
    }

    function afterExchangeSgrForEth(address _sender, uint256 _sgrAmount, uint256 _ethAmount) external{
        boolResult = sgrTokenManager.afterExchangeSgrForEth(_sender, _sgrAmount, _ethAmount);
    }

    function afterTransfer(address _sender, address _to, uint256 _value, bool _transferResult) external{
        boolResult = sgrTokenManager.afterTransfer(_sender, _to, _value, _transferResult);
    }

    function afterTransferFrom(address _sender, address _from, address _to, uint256 _value, bool _transferFromResult) external{
        boolResult = sgrTokenManager.afterTransferFrom(_sender, _from, _to, _value, _transferFromResult);
    }
}