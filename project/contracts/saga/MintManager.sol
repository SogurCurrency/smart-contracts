pragma solidity 0.4.25;

import "./interfaces/IModelDataSource.sol";
import "./interfaces/IMintingPointTimersManager.sol";
import "./interfaces/ISGAAuthorizationManager.sol";
import "./interfaces/IMintListener.sol";

import "../saga-genesis/interfaces/IMintHandler.sol";
import "../saga-genesis/interfaces/IMintManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Mint Manager.
 */
contract MintManager is IMintManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

    uint256 public index;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IModelDataSource interface.
     */
    function getModelDataSource() public view returns (IModelDataSource) {
        return IModelDataSource(getContractAddress(_IModelDataSource_));
    }

    /**
     * @dev Return the contract which implements the IMintingPointTimersManager interface.
     */
    function getMintingPointTimersManager() public view returns (IMintingPointTimersManager) {
        return IMintingPointTimersManager(getContractAddress(_IMintingPointTimersManager_));
    }

    /**
     * @dev Return the contract which implements the ISGAAuthorizationManager interface.
     */
    function getSGAAuthorizationManager() public view returns (ISGAAuthorizationManager) {
        return ISGAAuthorizationManager(getContractAddress(_ISGAAuthorizationManager_));
    }

    /**
     * @dev Return the contract which implements the IMintHandler interface.
     */
    function getMintHandler() public view returns (IMintHandler) {
        return IMintHandler(getContractAddress(_IMintHandler_));
    }

    /**
     * @dev Return the contract which implements the IMintListener interface.
     */
    function getMintListener() public view returns (IMintListener) {
        return IMintListener(getContractAddress(_IMintListener_));
    }

    /**
     * @dev Return whether or not the minting-state should be updated.
     */
    function isMintingStateOutdated() public view returns (bool) {
        return getMintingPointTimersManager().expired(index + 1);
    }

    /**
     * @dev Update the minting-state if it is outdated.
     */
    function updateMintingState() external {
        require(getSGAAuthorizationManager().isAuthorizedForPublicOperation(msg.sender), "update minting state is not authorized");
        if (isMintingStateOutdated()) {
            uint256 amount = getModelDataSource().getRequiredMintAmount(index);
            getMintListener().mintSgaForSgnHolders(amount);
            getMintHandler().mintSgnVestedInDelay(index + 1);
            index += 1;
        }
    }

    /**
     * @dev Return the current minting-point index.
     */
    function getIndex() external view returns (uint256) {
        return index;
    }
}
