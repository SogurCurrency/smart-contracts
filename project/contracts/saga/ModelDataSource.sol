pragma solidity 0.4.25;

import "./interfaces/IModelDataSource.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Model Data Source.
 */
contract ModelDataSource is IModelDataSource, Claimable {
    string public constant VERSION = "1.0.0";

    struct Interval {
        uint256 minN;
        uint256 maxN;
        uint256 minR;
        uint256 maxR;
        uint256 alpha;
        uint256 beta;
    }

    bool public intervalListsLocked;
    Interval[11][105] public intervalLists;

    /**
     * @dev Lock the interval lists.
     */
    function lock() external onlyOwner {
        intervalListsLocked = true;
    }

    /**
     * @dev Set interval parameters.
     * @param _rowNum Interval row index.
     * @param _colNum Interval column index.
     * @param _minN   Interval minimum amount of SGA.
     * @param _maxN   Interval maximum amount of SGA.
     * @param _minR   Interval minimum amount of SDR.
     * @param _maxR   Interval maximum amount of SDR.
     * @param _alpha  Interval alpha value (scaled up).
     * @param _beta   Interval beta  value (scaled up).
     */
    function setInterval(uint256 _rowNum, uint256 _colNum, uint256 _minN, uint256 _maxN, uint256 _minR, uint256 _maxR, uint256 _alpha, uint256 _beta) external onlyOwner {
        require(!intervalListsLocked, "interval lists are already locked");
        intervalLists[_rowNum][_colNum] = Interval({minN: _minN, maxN: _maxN, minR: _minR, maxR: _maxR, alpha: _alpha, beta: _beta});
    }

    /**
     * @dev Get interval parameters.
     * @param _rowNum Interval row index.
     * @param _colNum Interval column index.
     * @return Interval minimum amount of SGA.
     * @return Interval maximum amount of SGA.
     * @return Interval minimum amount of SDR.
     * @return Interval maximum amount of SDR.
     * @return Interval alpha value (scaled up).
     * @return Interval beta  value (scaled up).
     */
    function getInterval(uint256 _rowNum, uint256 _colNum) external view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        Interval storage interval = intervalLists[_rowNum][_colNum];
        return (interval.minN, interval.maxN, interval.minR, interval.maxR, interval.alpha, interval.beta);
    }

    /**
     * @dev Get interval alpha and beta.
     * @param _rowNum Interval row index.
     * @param _colNum Interval column index.
     * @return Interval alpha value (scaled up).
     * @return Interval beta  value (scaled up).
     */
    function getIntervalCoefs(uint256 _rowNum, uint256 _colNum) external view returns (uint256, uint256) {
        Interval storage interval = intervalLists[_rowNum][_colNum];
        return (interval.alpha, interval.beta);
    }

    /**
     * @dev Get the amount of SGA required for moving to the next minting-point.
     * @param _rowNum Interval row index.
     * @return Required amount of SGA.
     */
    function getRequiredMintAmount(uint256 _rowNum) external view returns (uint256) {
        uint256 currMaxN = intervalLists[_rowNum + 0][0].maxN;
        uint256 nextMinN = intervalLists[_rowNum + 1][0].minN;
        assert(nextMinN >= currMaxN);
        return nextMinN - currMaxN;
    }
}
