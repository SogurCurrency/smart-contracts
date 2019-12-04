pragma solidity 0.4.25;

import "../interfaces/IModelCalculator.sol";

contract ModelCalculatorMockup is IModelCalculator {
    function isTrivialInterval(uint256 _alpha, uint256 _beta) external pure returns (bool) {
        return _alpha == 0 && _beta == 0;
    }

    function getValN(uint256 _valR, uint256 _maxN, uint256 _maxR) external pure returns (uint256) {
        _maxN;
        _maxR;
        return _valR;
    }

    function getValR(uint256 _valN, uint256 _maxR, uint256 _maxN) external pure returns (uint256) {
        _maxR;
        _maxN;
        return _valN;
    }

    function getNewN(uint256 _newR, uint256 _minR, uint256 _minN, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        _minR;
        _minN;
        _alpha;
        _beta;
        return _newR;
    }

    function getNewR(uint256 _newN, uint256 _minN, uint256 _minR, uint256 _alpha, uint256 _beta) external pure returns (uint256) {
        _minN;
        _minR;
        _alpha;
        _beta;
        return _newN;
    }
}
