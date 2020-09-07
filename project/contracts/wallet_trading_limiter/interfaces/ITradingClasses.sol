pragma solidity 0.4.25;

/**
 * @title Trading Classes Interface.
 */
interface ITradingClasses {
    /**
     * @dev Get the complete info of a class.
     * @param _id The id of the class.
     * @return complete info of a class.
     */
    function getInfo(uint256 _id) external view returns (uint256, uint256, uint256);

    /**
     * @dev Get the action-role of a class.
     * @param _id The id of the class.
     * @return The action-role of the class.
     */
    function getActionRole(uint256 _id) external view returns (uint256);

    /**
     * @dev Get the sell limit of a class.
     * @param _id The id of the class.
     * @return The sell limit of the class.
     */
    function getSellLimit(uint256 _id) external view returns (uint256);

    /**
     * @dev Get the buy limit of a class.
     * @param _id The id of the class.
     * @return The buy limit of the class.
     */
    function getBuyLimit(uint256 _id) external view returns (uint256);
}
