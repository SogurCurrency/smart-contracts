pragma solidity 0.4.25;

import "./interfaces/ISGNAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../authorization/AuthorizationActionRoles.sol";
import "../authorization/interfaces/IAuthorizationDataSource.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGN Authorization Manager.
 */
contract SGNAuthorizationManager is ISGNAuthorizationManager, ContractAddressLocatorHolder {
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
     * @dev Determine whether or not a wallet is authorized to sell SGN.
     * @param _sender The address of the wallet.
     * @return Authorization status.
     */
    function isAuthorizedToSell(address _sender) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole) = authorizationDataSource.getAuthorizedActionRole(_sender);
        return senderIsWhitelisted && senderActionRole.isAuthorizedToSellSgn();
    }

    /**
     * @dev Determine whether or not a wallet is authorized to transfer SGN to another wallet.
     * @param _sender The address of the source wallet.
     * @param _target The address of the target wallet.
     * @return Authorization status.
     */
    function isAuthorizedToTransfer(address _sender, address _target) external view returns (bool) {
        IAuthorizationDataSource authorizationDataSource = getAuthorizationDataSource();
        (bool senderIsWhitelisted, uint256 senderActionRole) = authorizationDataSource.getAuthorizedActionRole(_sender);
        (bool targetIsWhitelisted, uint256 targetActionRole) = authorizationDataSource.getAuthorizedActionRole(_target);
        return senderIsWhitelisted && senderActionRole.isAuthorizedToTransferSgn()
            && targetIsWhitelisted && targetActionRole.isAuthorizedToReceiveSgn();
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
        (bool senderIsWhitelisted, uint256 senderActionRole) = authorizationDataSource.getAuthorizedActionRole(_sender);
        (bool sourceIsWhitelisted, uint256 sourceActionRole) = authorizationDataSource.getAuthorizedActionRole(_source);
        (bool targetIsWhitelisted, uint256 targetActionRole) = authorizationDataSource.getAuthorizedActionRole(_target);
        return senderIsWhitelisted && senderActionRole.isAuthorizedToTransferFromSgn()
            && sourceIsWhitelisted && sourceActionRole.isAuthorizedToTransferSgn()
            && targetIsWhitelisted && targetActionRole.isAuthorizedToReceiveSgn();
    }
}
