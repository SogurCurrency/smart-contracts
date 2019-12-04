pragma solidity 0.4.25;

import "../utils/Adminable.sol";
import "./interfaces/IWalletsTradingLimiterValueConverter.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Wallets Trading Limiter Value Converter.
 */
contract WalletsTradingLimiterValueConverter is IWalletsTradingLimiterValueConverter, Adminable {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    /**
     * @dev price maximum resolution.
     * @notice Allow for sufficiently-high resolution.
     * @notice Prevents multiplication-overflow.
     */
    uint256 public constant MAX_RESOLUTION = 0x10000000000000000;

    uint256 public sequenceNum = 0;
    uint256 public priceN = 0;
    uint256 public priceD = 0;

    event PriceSaved(uint256 _priceN, uint256 _priceD);
    event PriceNotSaved(uint256 _priceN, uint256 _priceD);

    /**
     * @dev Set the price.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _priceN The numerator of the price.
     * @param _priceD The denominator of the price.
     */
    function setPrice(uint256 _sequenceNum, uint256 _priceN, uint256 _priceD) external onlyAdmin {
        require(1 <= _priceN && _priceN <= MAX_RESOLUTION, "price numerator is out of range");
        require(1 <= _priceD && _priceD <= MAX_RESOLUTION, "price denominator is out of range");

        if (sequenceNum < _sequenceNum) {
            sequenceNum = _sequenceNum;
            priceN = _priceN;
            priceD = _priceD;
            emit PriceSaved(_priceN, _priceD);
        }
        else {
            emit PriceNotSaved(_priceN, _priceD);
        }
    }

    /**
     * @dev Get the current limiter worth of a given SGA amount.
     * @param _sgaAmount The amount of SGA to convert.
     * @return The equivalent limiter amount.
     */
    function toLimiterValue(uint256 _sgaAmount) external view returns (uint256) {
        assert(priceN > 0 && priceD > 0);
        return _sgaAmount.mul(priceN) / priceD;
    }
}
