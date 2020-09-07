pragma solidity 0.4.25;

import "../interfaces/ISGNConversionManager.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SGNConversionManagerMockup is ISGNConversionManager {
    using SafeMath for uint256;

    uint256 private ratio;

    function setRatio(uint256 _ratio) external {
        ratio = _ratio;
    }

    function sgn2sgr(uint256 _amount, uint256 _index) external view returns (uint256) {
        _index;
        return ratio.mul(_amount);
    }
}
