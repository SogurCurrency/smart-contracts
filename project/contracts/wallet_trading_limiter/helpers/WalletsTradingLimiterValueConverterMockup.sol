pragma solidity 0.4.25;

import "../interfaces/IWalletsTradingLimiterValueConverter.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract WalletsTradingLimiterValueConverterMockup is IWalletsTradingLimiterValueConverter {
    using SafeMath for uint256;

    uint256 private ratio;

    function toLimiterValue(uint256 _sgrAmount) external view returns (uint256) {
        return ratio.mul(_sgrAmount);
    }

    function setRatio(uint256 _ratio) external {
        ratio = _ratio;
    }
}
