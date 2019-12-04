pragma solidity 0.4.25;

import "../wallet_trading_limiter/WalletsTradingLimiterBase.sol";
import "./interfaces/IMintManager.sol";
import "./interfaces/ISGNConversionManager.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGN Wallets Trading Limiter.
 */
contract SGNWalletsTradingLimiter is WalletsTradingLimiterBase {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;
    using Math for uint256;

    /**
     * @dev SGN minimum limiter value maximum resolution.
     * @notice Allow for sufficiently-high resolution.
     * @notice Prevents multiplication-overflow.
     */
    uint256 public constant MAX_RESOLUTION = 0x10000000000000000;

    uint256 public sequenceNum = 0;
    uint256 public sgnMinimumLimiterValueN = 0;
    uint256 public sgnMinimumLimiterValueD = 0;

    event SGNMinimumLimiterValueSaved(uint256 _sgnMinimumLimiterValueN, uint256 _sgnMinimumLimiterValueD);
    event SGNMinimumLimiterValueNotSaved(uint256 _sgnMinimumLimiterValueN, uint256 _sgnMinimumLimiterValueD);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) WalletsTradingLimiterBase(_contractAddressLocator) public {}

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
     * @dev Get the limiter value.
     * @param _value The SGN amount to convert to limiter value.
     * @return The limiter value worth of the given SGN amount.
     */
    function getLimiterValue(uint256 _value) public view returns (uint256){
        uint256 sgnMinimumLimiterValue = calcSGNMinimumLimiterValue(_value);
        uint256 sgnConversionValue = calcSGNConversionValue(_value);

        return sgnConversionValue.max(sgnMinimumLimiterValue);
    }

    /**
     * @dev Get the contract locator identifier that is permitted to perform update wallet.
     * @return The contract locator identifier.
     */
    function getUpdateWalletPermittedContractLocatorIdentifier() public pure returns (bytes32){
        return _ISGNTokenManager_;
    }

    /**
     * @dev Calculate SGN minimum limiter value.
     * @param _sgnAmount The given SGN amount.
     * @return The calculated SGN minimum limiter value.
     */
    function calcSGNMinimumLimiterValue(uint256 _sgnAmount) public view returns (uint256) {
        assert(sgnMinimumLimiterValueN > 0 && sgnMinimumLimiterValueD > 0);
        return _sgnAmount.mul(sgnMinimumLimiterValueN) / sgnMinimumLimiterValueD;
    }

    /**
     * @dev Set SGN minimum value.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _sgnMinimumLimiterValueN The numerator of the SGN minimum limiter value.
     * @param _sgnMinimumLimiterValueD The denominator of the SGN minimum limiter value.
     */
    function setSGNMinimumLimiterValue(uint256 _sequenceNum, uint256 _sgnMinimumLimiterValueN, uint256 _sgnMinimumLimiterValueD) external onlyOwner {
        require(1 <= _sgnMinimumLimiterValueN && _sgnMinimumLimiterValueN <= MAX_RESOLUTION, "SGN minimum limiter value numerator is out of range");
        require(1 <= _sgnMinimumLimiterValueD && _sgnMinimumLimiterValueD <= MAX_RESOLUTION, "SGN minimum limiter value denominator is out of range");

        if (sequenceNum < _sequenceNum) {
            sequenceNum = _sequenceNum;
            sgnMinimumLimiterValueN = _sgnMinimumLimiterValueN;
            sgnMinimumLimiterValueD = _sgnMinimumLimiterValueD;
            emit SGNMinimumLimiterValueSaved(_sgnMinimumLimiterValueN, _sgnMinimumLimiterValueD);
        }
        else {
            emit SGNMinimumLimiterValueNotSaved(_sgnMinimumLimiterValueN, _sgnMinimumLimiterValueD);
        }
    }

    /**
     * @dev Calculate SGN conversion value.
     * @param _sgnAmount The SGN amount to convert to limiter value.
     * @return The limiter value worth of the given SGN.
     */
    function calcSGNConversionValue(uint256 _sgnAmount) private view returns (uint256) {
        uint256 sgaAmount = getSGNConversionManager().sgn2sga(_sgnAmount, getMintManager().getIndex());
        return getWalletsTradingLimiterValueConverter().toLimiterValue(sgaAmount);
    }


}