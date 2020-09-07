pragma solidity 0.4.25;

/**
 * @title Transaction Manager Interface.
 */
interface ITransactionManager {
    /**
     * @dev Buy SGR in exchange for ETH.
     * @param _ethAmount The amount of ETH received from the buyer.
     * @return The amount of SGR that the buyer is entitled to receive.
     */
    function buy(uint256 _ethAmount) external returns (uint256);

    /**
     * @dev Sell SGR in exchange for ETH.
     * @param _sgrAmount The amount of SGR received from the seller.
     * @return The amount of ETH that the seller is entitled to receive.
     */
    function sell(uint256 _sgrAmount) external returns (uint256);
}
