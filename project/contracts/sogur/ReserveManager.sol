pragma solidity 0.4.25;

import "./interfaces/IReserveManager.sol";
import "./interfaces/IPaymentManager.sol";
import "./interfaces/IETHConverter.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Reserve Manager.
 */
contract ReserveManager is IReserveManager, ContractAddressLocatorHolder, Claimable {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    struct Wallets {
        address deposit;
        address withdraw;
    }

    struct Thresholds {
        uint256 min;
        uint256 max;
        uint256 mid;
    }

    Wallets public wallets;

    Thresholds public thresholds;

    uint256 public walletsSequenceNum = 0;
    uint256 public thresholdsSequenceNum = 0;

    event ReserveWalletsSaved(address _deposit, address _withdraw);
    event ReserveWalletsNotSaved(address _deposit, address _withdraw);
    event ReserveThresholdsSaved(uint256 _min, uint256 _max, uint256 _mid);
    event ReserveThresholdsNotSaved(uint256 _min, uint256 _max, uint256 _mid);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IETHConverter interface.
     */
    function getETHConverter() public view returns (IETHConverter) {
        return IETHConverter(getContractAddress(_IETHConverter_));
    }

    /**
     * @dev Return the contract which implements the IPaymentManager interface.
     */
    function getPaymentManager() public view returns (IPaymentManager) {
        return IPaymentManager(getContractAddress(_IPaymentManager_));
    }

    /**
     * @dev Set the reserve wallets.
     * @param _walletsSequenceNum The sequence-number of the operation.
     * @param _deposit The address of the wallet permitted to deposit ETH into the token-contract.
     * @param _withdraw The address of the wallet permitted to withdraw ETH from the token-contract.
     */
    function setWallets(uint256 _walletsSequenceNum, address _deposit, address _withdraw) external onlyOwner {
        require(_deposit != address(0), "deposit-wallet is illegal");
        require(_withdraw != address(0), "withdraw-wallet is illegal");

        if (walletsSequenceNum < _walletsSequenceNum) {
            walletsSequenceNum = _walletsSequenceNum;
            wallets.deposit = _deposit;
            wallets.withdraw = _withdraw;

            emit ReserveWalletsSaved(_deposit, _withdraw);
        }
        else {
            emit ReserveWalletsNotSaved(_deposit, _withdraw);
        }
    }

    /**
     * @dev Set the reserve thresholds.
     * @param _thresholdsSequenceNum The sequence-number of the operation.
     * @param _min The maximum balance which allows depositing ETH from the token-contract.
     * @param _max The minimum balance which allows withdrawing ETH into the token-contract.
     * @param _mid The balance that the deposit/withdraw recommendation functions will yield.
     */
    function setThresholds(uint256 _thresholdsSequenceNum, uint256 _min, uint256 _max, uint256 _mid) external onlyOwner {
        require(_min <= _mid, "min-threshold is greater than mid-threshold");
        require(_max >= _mid, "max-threshold is smaller than mid-threshold");

        if (thresholdsSequenceNum < _thresholdsSequenceNum) {
            thresholdsSequenceNum = _thresholdsSequenceNum;
            thresholds.min = _min;
            thresholds.max = _max;
            thresholds.mid = _mid;

            emit ReserveThresholdsSaved(_min, _max, _mid);
        }
        else {
            emit ReserveThresholdsNotSaved(_min, _max, _mid);
        }
    }

    /**
     * @dev Get a deposit-recommendation.
     * @param _balance The balance of the token-contract.
     * @return The address of the wallet permitted to deposit ETH into the token-contract.
     * @return The amount that should be deposited in order for the balance to reach `mid` ETH.
     */
    function getDepositParams(uint256 _balance) external view returns (address, uint256) {
        uint256 depositRecommendation = 0;
        uint256 sdrPaymentsSum = getPaymentManager().getPaymentsSum();
        uint256 ethPaymentsSum = getETHConverter().toEthAmount(sdrPaymentsSum);
        if (ethPaymentsSum >= _balance || (_balance - ethPaymentsSum) <= thresholds.min){// first part of the condition
            // prevents underflow in the second part
            depositRecommendation = (thresholds.mid).add(ethPaymentsSum) - _balance;// will never underflow
        }
        return (wallets.deposit, depositRecommendation);
    }

    /**
     * @dev Get a withdraw-recommendation.
     * @param _balance The balance of the token-contract.
     * @return The address of the wallet permitted to withdraw ETH into the token-contract.
     * @return The amount that should be withdrawn in order for the balance to reach `mid` ETH.
     */
    function getWithdrawParams(uint256 _balance) external view returns (address, uint256) {
        uint256 withdrawRecommendationAmount = 0;
        if (_balance >= thresholds.max && getPaymentManager().getNumOfPayments() == 0){// _balance >= thresholds.max >= thresholds.mid
            withdrawRecommendationAmount = _balance - thresholds.mid; // will never underflow
        }

        return (wallets.withdraw, withdrawRecommendationAmount);
    }
}
