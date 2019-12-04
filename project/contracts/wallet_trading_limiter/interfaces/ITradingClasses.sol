pragma solidity 0.4.25;

/**
 * @title Trading Classes Interface.
 */
interface ITradingClasses {
    /**
     * @dev Get the limit of a class.
     * @param _id The id of the class.
     * @return The limit of the class.
     */
    function getLimit(uint256 _id) external view returns (uint256);
}
