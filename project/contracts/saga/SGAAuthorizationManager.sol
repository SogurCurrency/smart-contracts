pragma solidity 0.4.25;

import "./interfaces/ISGAAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../authorization/AuthorizationActionRoles.sol";
import "../authorization/interfaces/IAuthorizationDataSource.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGA Authorization Manager.
 */
contract SGAAuthorizationManager is ISGAAuthorizationManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

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
     * @dev Determine whether or not a user is authorized to buy SGA.
     * @param _sender The address of the user.
     * @return Authorization status.
     */
    function isAuthorizedToBuy(address _sender) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole) = authorizationDataSource.getAuthorizedActionRole(_sender);
        return senderIsWhitelisted && senderActionRole.isAuthorizedToBuySga();
    }

    /**
     * @dev Determine whether or not a user is authorized to sell SGA.
     * @param _sender The address of the user.
     * @return Authorization status.
     */
    function isAuthorizedToSell(address _sender) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole) = authorizationDataSource.getAuthorizedActionRole(_sender);
        return senderIsWhitelisted && senderActionRole.isAuthorizedToSellSga();
    }

    /**
     * @dev Determine whether or not a user is authorized to transfer SGA to another user.
     * @param _sender The address of the source user.
     * @param _target The address of the target user.
     * @return Authorization status.
     */
    function isAuthorizedToTransfer(address _sender, address _target) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole) = authorizationDataSource.getAuthorizedActionRole(_sender);
        (bool targetIsWhitelisted, uint256 targetActionRole) = authorizationDataSource.getAuthorizedActionRole(_target);
        return senderIsWhitelisted && senderActionRole.isAuthorizedToTransferSga()
            && targetIsWhitelisted && targetActionRole.isAuthorizedToReceiveSga();
    }

    /**
     * @dev Determine whether or not a user is authorized to transfer SGA from one user to another user.
     * @param _sender The address of the custodian user.
     * @param _source The address of the source user.
     * @param _target The address of the target user.
     * @return Authorization status.
     */
    function isAuthorizedToTransferFrom(address _sender, address _source, address _target) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole) = authorizationDataSource.getAuthorizedActionRole(_sender);
        (bool sourceIsWhitelisted, uint256 sourceActionRole) = authorizationDataSource.getAuthorizedActionRole(_source);
        (bool targetIsWhitelisted, uint256 targetActionRole) = authorizationDataSource.getAuthorizedActionRole(_target);
        return senderIsWhitelisted && senderActionRole.isAuthorizedToTransferFromSga()
            && sourceIsWhitelisted && sourceActionRole.isAuthorizedToTransferSga()
            && targetIsWhitelisted && targetActionRole.isAuthorizedToReceiveSga();
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
}
