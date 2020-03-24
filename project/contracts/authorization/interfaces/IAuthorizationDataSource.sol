pragma solidity 0.4.25;

/**
 * @title Authorization Data Source Interface.
 */
interface IAuthorizationDataSource {
    /**
     * @dev Get the authorized action-role of a wallet.
     * @param _wallet The address of the wallet.
     * @return The authorized action-role of the wallet.
     */
    function getAuthorizedActionRole(address _wallet) external view returns (bool, uint256);

    /**
     * @dev Get the authorized action-role and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The authorized action-role and class of the wallet.
     */
    function getAuthorizedActionRoleAndClass(address _wallet) external view returns (bool, uint256, uint256);

    /**
     * @dev Get all the trade-limits and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The trade-limits and trade-class of the wallet.
     */
    function getTradeLimitsAndClass(address _wallet) external view returns (uint256, uint256, uint256);


    /**
     * @dev Get the buy trade-limit and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The buy trade-limit and trade-class of the wallet.
     */
    function getBuyTradeLimitAndClass(address _wallet) external view returns (uint256, uint256);

    /**
     * @dev Get the sell trade-limit and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The sell trade-limit and trade-class of the wallet.
     */
    function getSellTradeLimitAndClass(address _wallet) external view returns (uint256, uint256);
}
