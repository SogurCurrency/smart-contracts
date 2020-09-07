pragma solidity 0.4.25;

import "./ModelDataSource.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";


/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Batch Set Model Data Source.
 */
contract BatchSetModelDataSource is Claimable {
    string public constant VERSION = "1.0.0";

    uint256 public constant MAX_INTERVAL_INPUT_LENGTH = 32;

    ModelDataSource public modelDataSource;

    /*
     * @dev Create the contract.
     */
    constructor(address _modelDataSourceAddress) public {
        require(_modelDataSourceAddress != address(0), "model data source address is illegal");
        modelDataSource = ModelDataSource(_modelDataSourceAddress);
    }

    /**
     * @dev Set model data source intervals.
     */
    function setIntervals(uint256 _intervalsCount,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _rowNum,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _colNum,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _minN,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _maxN,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _minR,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _maxR,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _alpha,
        uint256[MAX_INTERVAL_INPUT_LENGTH] _beta) external onlyOwner {
        require(_intervalsCount < MAX_INTERVAL_INPUT_LENGTH, "intervals count must be lower than MAX_INTERVAL_INPUT_LENGTH");

        for (uint256 i = 0; i < _intervalsCount; i++) {
            modelDataSource.setInterval(_rowNum[i], _colNum[i], _minN[i], _maxN[i], _minR[i], _maxR[i], _alpha[i], _beta[i]);
        }
    }

    /**
     * @dev Claim model data source ownership.
     */
    function claimOwnershipModelDataSource() external onlyOwner {
        modelDataSource.claimOwnership();
    }

    /**
     * @dev Renounce model data source ownership.
     */
    function renounceOwnershipModelDataSource() external onlyOwner {
        modelDataSource.renounceOwnership();
    }

    /**
     * @dev Lock model data source.
     */
    function lockModelDataSource() external onlyOwner {
        modelDataSource.lock();
    }
}
