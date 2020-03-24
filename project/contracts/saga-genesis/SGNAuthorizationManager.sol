pragma solidity 0.4.25;

import "./interfaces/ISGNAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../authorization/AuthorizationActionRoles.sol";
import "../authorization/interfaces/IAuthorizationDataSource.sol";
import "../wallet_trading_limiter/interfaces/ITradingClasses.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGN Authorization Manager.
 */
contract SGNAuthorizationManager is ISGNAuthorizationManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.1.0";

    using AuthorizationActionRoles for uint256;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IAuthorizationDataSource interface.
     */
    function getAuthorizationDataSource() public view returns (IAuthorizationDataSource) {
        return IAuthorizationDataSource(getContractAddress(_IAuthorizationDataSource_));
    }

    /**
    * @dev Return the contract which implements the ITradingClasses interface.
    */
    function getTradingClasses() public view returns (ITradingClasses) {
        return ITradingClasses(getContractAddress(_ITradingClasses_));
    }

    /**
     * @dev Determine whether or not a wallet is authorized to sell SGN.
     * @param _sender The address of the wallet.
     * @return Authorization status.
     */
    function isAuthorizedToSell(address _sender) external view returns (bool) {
        (bool senderIsWhitelisted, uint256 senderActionRole, uint256 senderTradeClassId) = getAuthorizationDataSource().getAuthorizedActionRoleAndClass(_sender);

        return senderIsWhitelisted && getActionRole(senderActionRole, senderTradeClassId).isAuthorizedToSellSgn();
    }

    /**
     * @dev Determine whether or not a wallet is authorized to transfer SGN to another wallet.
     * @param _sender The address of the source wallet.
     * @param _target The address of the target wallet.
     * @return Authorization status.
     */
    function isAuthorizedToTransfer(address _sender, address _target) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole, uint256 senderTradeClassId) = authorizationDataSource.getAuthorizedActionRoleAndClass(_sender);
        (bool targetIsWhitelisted, uint256 targetActionRole, uint256 targetTradeClassId) = authorizationDataSource.getAuthorizedActionRoleAndClass(_target);

        return senderIsWhitelisted && targetIsWhitelisted &&
        getActionRole(senderActionRole, senderTradeClassId).isAuthorizedToTransferSgn() &&
        getActionRole(targetActionRole, targetTradeClassId).isAuthorizedToReceiveSgn();
    }

    /**
     * @dev Determine whether or not a wallet is authorized to transfer SGN from one wallet to another wallet.
     * @param _sender The address of the wallet initiating the transaction.
     * @param _source The address of the source wallet.
     * @param _target The address of the target wallet.
     * @return Authorization status.
     */
    function isAuthorizedToTransferFrom(address _sender, address _source, address _target) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole, uint256 senderTradeClassId) = authorizationDataSource.getAuthorizedActionRoleAndClass(_sender);
        (bool sourceIsWhitelisted, uint256 sourceActionRole, uint256 sourceTradeClassId) = authorizationDataSource.getAuthorizedActionRoleAndClass(_source);
        (bool targetIsWhitelisted, uint256 targetActionRole, uint256 targetTradeClassId) = authorizationDataSource.getAuthorizedActionRoleAndClass(_target);

        return senderIsWhitelisted && sourceIsWhitelisted && targetIsWhitelisted &&
        getActionRole(senderActionRole, senderTradeClassId).isAuthorizedToTransferFromSgn() &&
        getActionRole(sourceActionRole, sourceTradeClassId).isAuthorizedToTransferSgn() &&
        getActionRole(targetActionRole, targetTradeClassId).isAuthorizedToReceiveSgn();
    }

    /**
     * @dev Get the relevant action-role.
     * @return The relevant action-role.
     */
    function getActionRole(uint256 _actionRole, uint256 _tradeClassId) private view returns (uint256) {
        return _actionRole > 0 ? _actionRole : getTradingClasses().getActionRole(_tradeClassId);
    }
}
