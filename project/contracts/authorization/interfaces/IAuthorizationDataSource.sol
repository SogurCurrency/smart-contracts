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
     * @dev Get the trade-limit and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The trade-limit and trade-class of the wallet.
     */
    function getTradeLimitAndClass(address _wallet) external view returns (uint256, uint256);
}
