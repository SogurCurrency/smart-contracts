pragma solidity 0.4.25;

import "./interfaces/IMintManager.sol";
import "./interfaces/ISGNTokenManager.sol";
import "./interfaces/ISGNConversionManager.sol";
import "./interfaces/ISGNAuthorizationManager.sol";
import "../wallet_trading_limiter/interfaces/IWalletsTradingLimiter.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGN Token Manager.
 */
contract SGNTokenManager is ISGNTokenManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

    event ExchangeSgnForSgaCompleted(address indexed _user, uint256 _input, uint256 _output);
    event MintSgnVestedInDelayCompleted(uint256 _value);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the ISGNAuthorizationManager interface.
     */
    function getSGNAuthorizationManager() public view returns (ISGNAuthorizationManager) {
        return ISGNAuthorizationManager(getContractAddress(_ISGNAuthorizationManager_));
    }

    /**
     * @dev Return the contract which implements the ISGNConversionManager interface.
     */
    function getSGNConversionManager() public view returns (ISGNConversionManager) {
        return ISGNConversionManager(getContractAddress(_ISGNConversionManager_));
    }

    /**
     * @dev Return the contract which implements the IMintManager interface.
     */
    function getMintManager() public view returns (IMintManager) {
        return IMintManager(getContractAddress(_IMintManager_));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingLimiter interface.
     */
    function getWalletsTradingLimiter() public view returns (IWalletsTradingLimiter) {
        return IWalletsTradingLimiter(getContractAddress(_WalletsTradingLimiter_SGNTokenManager_));
    }

    /**
     * @dev Get the current SGA worth of a given SGN amount.
     * @param _sgnAmount The amount of SGN to convert.
     * @return The equivalent amount of SGA.
     */
    function convertSgnToSga(uint256 _sgnAmount) external view returns (uint256) {
        return convertSgnToSgaFunc(_sgnAmount);
    }

    /**
     * @dev Exchange SGN for SGA.
     * @param _sender The address of the sender.
     * @param _sgnAmount The amount of SGN received.
     * @return The amount of SGA that the sender is entitled to.
     */
    function exchangeSgnForSga(address _sender, uint256 _sgnAmount) external only(_ISGNToken_) returns (uint256) {
        require(getSGNAuthorizationManager().isAuthorizedToSell(_sender), "exchanging SGN for SGA is not authorized");
        uint256 sgaAmount = convertSgnToSgaFunc(_sgnAmount);
        require(sgaAmount > 0, "returned amount is zero");
        emit ExchangeSgnForSgaCompleted(_sender, _sgnAmount, sgaAmount);
        return sgaAmount;
    }

    /**
     * @dev Handle direct SGN transfer.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The amount of SGN to be transferred.
     */
    function uponTransfer(address _sender, address _to, uint256 _value) external only(_ISGNToken_) {
        require(getSGNAuthorizationManager().isAuthorizedToTransfer(_sender, _to), "direct-transfer of SGN is not authorized");
        getWalletsTradingLimiter().updateWallet(_to, _value);
        _value;
    }

    /**
     * @dev Handle custodian SGN transfer.
     * @param _sender The address of the sender.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGN to be transferred.
     */
    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external only(_ISGNToken_) {
        require(getSGNAuthorizationManager().isAuthorizedToTransferFrom(_sender, _from, _to), "custodian-transfer of SGN is not authorized");
        getWalletsTradingLimiter().updateWallet(_to, _value);
        _value;
    }

    /** 
     * @dev Upon minting of SGN vested in delay.
     * @param _value The amount of SGN to mint.
     */
    function uponMintSgnVestedInDelay(uint256 _value) external only(_ISGNToken_) {
        emit MintSgnVestedInDelayCompleted(_value);
    }

    /**
     * @dev  Get the amount of SGA received upon conversion of a given SGN amount.
     * @param _sgnAmount the amount of SGN to convert.
     * @return The amount of SGA received upon conversion .
     */
    function convertSgnToSgaFunc(uint256 _sgnAmount) private view returns (uint256) {
        return getSGNConversionManager().sgn2sga(_sgnAmount, getMintManager().getIndex());
    }
}
