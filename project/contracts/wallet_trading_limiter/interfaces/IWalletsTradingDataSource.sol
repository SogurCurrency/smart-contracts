pragma solidity 0.4.25;

/**
 * @title Wallets Trading Data Source Interface.
 */
interface IWalletsTradingDataSource {
    /**
     * @dev Increment the value of a given wallet.
     * @param _wallet The address of the wallet.
     * @param _value The value to increment by.
     * @param _limit The limit of the wallet.
     */
    function updateWallet(address _wallet, uint256 _value, uint256 _limit) external;
}
