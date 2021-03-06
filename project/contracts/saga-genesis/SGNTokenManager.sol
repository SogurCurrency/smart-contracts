pragma solidity 0.4.25;

import "./interfaces/IMintManager.sol";
import "./interfaces/ISGNTokenManager.sol";
import "./interfaces/ISGNConversionManager.sol";
import "./interfaces/ISGNAuthorizationManager.sol";
import "../wallet_trading_limiter/interfaces/IWalletsTradingLimiter.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title SGN Token Manager.
 */
contract SGNTokenManager is ISGNTokenManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.1";

    event ExchangeSgnForSgrCompleted(address indexed _user, uint256 _input, uint256 _output);
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
     * @dev Get the current SGR worth of a given SGN amount.
       function name is convertSgnToSga and not convertSgnToSgr for backward compatibility.
     * @param _sgnAmount The amount of SGN to convert.
     * @return The equivalent amount of SGR.
     */
    function convertSgnToSga(uint256 _sgnAmount) external view returns (uint256) {
        return convertSgnToSgrFunc(_sgnAmount);
    }

    /**
     * @dev Exchange SGN for SGR.
       function name is exchangeSgnForSga and not exchangeSgnForSgr for backward compatibility.
     * @param _sender The address of the sender.
     * @param _sgnAmount The amount of SGN received.
     * @return The amount of SGR that the sender is entitled to.
     */
    function exchangeSgnForSga(address _sender, uint256 _sgnAmount) external only(_ISGNToken_) returns (uint256) {
        require(getSGNAuthorizationManager().isAuthorizedToSell(_sender), "exchanging SGN for SGR is not authorized");
        uint256 sgrAmount = convertSgnToSgrFunc(_sgnAmount);
        require(sgrAmount > 0, "returned amount is zero");
        emit ExchangeSgnForSgrCompleted(_sender, _sgnAmount, sgrAmount);
        return sgrAmount;
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
     * @dev  Get the amount of SGR received upon conversion of a given SGN amount.
     * @param _sgnAmount the amount of SGN to convert.
     * @return The amount of SGR received upon conversion .
     */
    function convertSgnToSgrFunc(uint256 _sgnAmount) private view returns (uint256) {
        return getSGNConversionManager().sgn2sgr(_sgnAmount, getMintManager().getIndex());
    }
}
