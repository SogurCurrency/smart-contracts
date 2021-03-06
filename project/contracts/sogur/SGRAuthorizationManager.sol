pragma solidity 0.4.25;

import "./interfaces/ISGRAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../authorization/AuthorizationActionRoles.sol";
import "../authorization/interfaces/IAuthorizationDataSource.sol";
import "../wallet_trading_limiter/interfaces/ITradingClasses.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title SGR Authorization Manager.
 */
contract SGRAuthorizationManager is ISGRAuthorizationManager, ContractAddressLocatorHolder {
    string public constant VERSION = "2.0.0";

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
     * @dev Determine whether or not a user is authorized to buy SGR.
     * @param _sender The address of the user.
     * @return Authorization status.
     */
    function isAuthorizedToBuy(address _sender) external view returns (bool) {
        (bool senderIsWhitelisted, uint256 senderActionRole, uint256 tradeClassId) = getAuthorizationDataSource().getAuthorizedActionRoleAndClass(_sender);

        return senderIsWhitelisted && getActionRole(senderActionRole, tradeClassId).isAuthorizedToBuySgr();
    }

    /**
     * @dev Determine whether or not a user is authorized to sell SGR.
     * @param _sender The address of the user.
     * @return Authorization status.
     */
    function isAuthorizedToSell(address _sender) external view returns (bool) {
        (bool senderIsWhitelisted, uint256 senderActionRole, uint256 tradeClassId) = getAuthorizationDataSource().getAuthorizedActionRoleAndClass(_sender);

        return senderIsWhitelisted && getActionRole(senderActionRole, tradeClassId).isAuthorizedToSellSgr();
    }

    /**
     * @dev User is always authorized to transfer SGR to another user.
     * @param _sender The address of the source user.
     * @param _target The address of the target user.
     * @return Authorization status.
     */
    function isAuthorizedToTransfer(address _sender, address _target) external view returns (bool) {
        _sender;
        _target;
        return true;
    }

    /**
     * @dev User is always authorized to transfer SGR from one user to another user.
     * @param _sender The address of the custodian user.
     * @param _source The address of the source user.
     * @param _target The address of the target user.
     * @return Authorization status.
     */
    function isAuthorizedToTransferFrom(address _sender, address _source, address _target) external view returns (bool) {
        _sender;
        _source;
        _target;
        return true;
    }

    /**
     * @dev Determine whether or not a user is authorized for public operation.
     * @param _sender The address of the user.
     * @return Authorization status.
     */
    function isAuthorizedForPublicOperation(address _sender) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted,) = authorizationDataSource.getAuthorizedActionRole(_sender);
        return senderIsWhitelisted;
    }

    /**
     * @dev Get the relevant action-role.
     * @return The relevant action-role.
     */
    function getActionRole(uint256 _actionRole, uint256 _tradeClassId) private view returns (uint256) {
        return  _actionRole > 0 ? _actionRole : getTradingClasses().getActionRole(_tradeClassId);
    }
}
