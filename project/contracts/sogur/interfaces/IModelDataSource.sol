pragma solidity 0.4.25;

/**
 * @title Model Data Source Interface.
 */
interface IModelDataSource {
    /**
     * @dev Get interval parameters.
     * @param _rowNum Interval row index.
     * @param _colNum Interval column index.
     * @return Interval minimum amount of SGR.
     * @return Interval maximum amount of SGR.
     * @return Interval minimum amount of SDR.
     * @return Interval maximum amount of SDR.
     * @return Interval alpha value (scaled up).
     * @return Interval beta  value (scaled up).
     */
    function getInterval(uint256 _rowNum, uint256 _colNum) external view returns (uint256, uint256, uint256, uint256, uint256, uint256);

    /**
     * @dev Get interval alpha and beta.
     * @param _rowNum Interval row index.
     * @param _colNum Interval column index.
     * @return Interval alpha value (scaled up).
     * @return Interval beta  value (scaled up).
     */
    function getIntervalCoefs(uint256 _rowNum, uint256 _colNum) external view returns (uint256, uint256);

    /**
     * @dev Get the amount of SGR required for moving to the next minting-point.
     * @param _rowNum Interval row index.
     * @return Required amount of SGR.
     */
    function getRequiredMintAmount(uint256 _rowNum) external view returns (uint256);
}
