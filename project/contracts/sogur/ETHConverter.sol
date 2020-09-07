pragma solidity 0.4.25;

import "../utils/Adminable.sol";
import "./interfaces/ITransactionLimiter.sol";
import "./interfaces/IETHConverter.sol";
import "./interfaces/IRateApprover.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title ETH Converter.
 */
contract ETHConverter is IETHConverter, ContractAddressLocatorHolder, Adminable {
    string public constant VERSION = "1.1.0";

    using SafeMath for uint256;

    /**
     * @dev SDR/ETH price maximum resolution.
     * @notice Allow for sufficiently-high resolution.
     * @notice Prevents multiplication-overflow.
     */
    uint256 public constant MAX_RESOLUTION = 0x10000000000000000;

    uint256 public sequenceNum = 0;
    uint256 public highPriceN = 0;
    uint256 public highPriceD = 0;
    uint256 public lowPriceN = 0;
    uint256 public lowPriceD = 0;

    event PriceSaved(uint256 _highPriceN, uint256 _highPriceD, uint256 _lowPriceN, uint256 _lowPriceD);
    event PriceNotSaved(uint256 _highPriceN, uint256 _highPriceD, uint256 _lowPriceN, uint256 _lowPriceD);

    /*
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the ITransactionLimiter interface.
     */
    function getTransactionLimiter() public view returns (ITransactionLimiter) {
        return ITransactionLimiter(getContractAddress(_ITransactionLimiter_));
    }

    /**
     * @dev Return the contract which implements the IRateApprover interface.
     */
    function getRateApprover() public view returns (IRateApprover) {
        return IRateApprover(getContractAddress(_IRateApprover_));
    }

    /**
     * @dev throw if called when low rate is not approved.
     */
    modifier onlyApprovedLowRate() {
        bool success = getRateApprover().approveLowRate(lowPriceN, lowPriceD);
        require(success, "invalid ETH-SDR rate");
        _;
    }

    /**
     * @dev throw if called when high rate is not approved.
     */
    modifier onlyApprovedHighRate() {
        bool success = getRateApprover().approveHighRate(highPriceN, highPriceD);
        require(success, "invalid ETH-SDR rate");
        _;
    }

    /**
     * @dev Set the SDR/ETH high price and the SDR/ETH low price.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _highPriceN The numerator of the SDR/ETH high price.
     * @param _highPriceD The denominator of the SDR/ETH high price.
     * @param _lowPriceN The numerator of the SDR/ETH low price.
     * @param _lowPriceD The denominator of the SDR/ETH low price.
     */
    function setPrice(uint256 _sequenceNum, uint256 _highPriceN, uint256 _highPriceD, uint256 _lowPriceN, uint256 _lowPriceD) external onlyAdmin {
        require(1 <= _highPriceN && _highPriceN <= MAX_RESOLUTION, "high price numerator is out of range");
        require(1 <= _highPriceD && _highPriceD <= MAX_RESOLUTION, "high price denominator is out of range");
        require(1 <= _lowPriceN && _lowPriceN <= MAX_RESOLUTION, "low price numerator is out of range");
        require(1 <= _lowPriceD && _lowPriceD <= MAX_RESOLUTION, "low price denominator is out of range");
        require(_highPriceN * _lowPriceD >= _highPriceD * _lowPriceN, "high price is smaller than low price");
        //will never overflow (MAX_RESOLUTION = 2^64 )

        if (sequenceNum < _sequenceNum) {
            sequenceNum = _sequenceNum;
            highPriceN = _highPriceN;
            highPriceD = _highPriceD;
            lowPriceN = _lowPriceN;
            lowPriceD = _lowPriceD;
            getTransactionLimiter().resetTotal();
            emit PriceSaved(_highPriceN, _highPriceD, _lowPriceN, _lowPriceD);
        }
        else {
            emit PriceNotSaved(_highPriceN, _highPriceD, _lowPriceN, _lowPriceD);
        }
    }

    /**
     * @dev Get the current SDR worth of a given ETH amount.
     * @param _ethAmount The amount of ETH to convert.
     * @return The equivalent amount of SDR.
     */
    function toSdrAmount(uint256 _ethAmount) external view onlyApprovedLowRate returns (uint256) {
        return _ethAmount.mul(lowPriceN) / lowPriceD;
    }

    /**
     * @dev Get the current ETH worth of a given SDR amount.
     * @param _sdrAmount The amount of SDR to convert.
     * @return The equivalent amount of ETH.
     */
    function toEthAmount(uint256 _sdrAmount) external view onlyApprovedHighRate returns (uint256) {
        return _sdrAmount.mul(highPriceD) / highPriceN;
    }

    /**
     * @dev Get the original SDR worth of a converted ETH amount.
     * @param _ethAmount The amount of ETH converted.
     * @return The original amount of SDR.
     */
    function fromEthAmount(uint256 _ethAmount) external view returns (uint256) {
        return _ethAmount.mul(highPriceN) / highPriceD;
    }
}
