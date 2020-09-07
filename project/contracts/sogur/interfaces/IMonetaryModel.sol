pragma solidity 0.4.25;

/**
 * @title Monetary Model Interface.
 */
interface IMonetaryModel {
    /**
     * @dev Buy SGR in exchange for SDR.
     * @param _sdrAmount The amount of SDR received from the buyer.
     * @return The amount of SGR that the buyer is entitled to receive.
     */
    function buy(uint256 _sdrAmount) external returns (uint256);

    /**
     * @dev Sell SGR in exchange for SDR.
     * @param _sgrAmount The amount of SGR received from the seller.
     * @return The amount of SDR that the seller is entitled to receive.
     */
    function sell(uint256 _sgrAmount) external returns (uint256);
}
