pragma solidity 0.4.25;

/**
 * @title SGN Conversion Manager Interface.
 */
interface ISGNConversionManager {
    /**
     * @dev Compute the SGA worth of a given SGN amount at a given minting-point.
     * @param _amount The amount of SGN.
     * @param _index The minting-point index.
     * @return The equivalent amount of SGA.
     */
    function sgn2sga(uint256 _amount, uint256 _index) external view returns (uint256);
}
