pragma solidity 0.4.25;

import "../interfaces/IModelDataSource.sol";

contract ModelDataSourceMockup is IModelDataSource {
    struct Interval {
        uint256 minN;
        uint256 maxN;
        uint256 minR;
        uint256 maxR;
        uint256 alpha;
        uint256 beta;
    }

    Interval private interval;

    function setInterval(uint256 _minN, uint256 _maxN, uint256 _minR, uint256 _maxR, uint256 _alpha, uint256 _beta) external {
        interval = Interval({minN: _minN, maxN: _maxN, minR: _minR, maxR: _maxR, alpha: _alpha, beta: _beta});
    }

    function getInterval(uint256 _rowNum, uint256 _colNum) external view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        _rowNum;
        _colNum;
        return (interval.minN, interval.maxN, interval.minR, interval.maxR, interval.alpha, interval.beta);
    }

    function getIntervalCoefs(uint256 _rowNum, uint256 _colNum) external view returns (uint256, uint256) {
        _rowNum;
        _colNum;
        return (interval.alpha, interval.beta);
    }

    function getRequiredMintAmount(uint256 _rowNum) external view returns (uint256) {
        _rowNum;
        return 0;
    }
}
