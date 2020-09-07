pragma solidity 0.4.25;

/**
 * @title Monetary Model State Interface.
 */
interface IMonetaryModelState {
    /**
     * @dev Set the total amount of SDR in the model.
     * @param _amount The total amount of SDR in the model.
     */
    function setSdrTotal(uint256 _amount) external;

    /**
     * @dev Set the total amount of SGR in the model.
     * @param _amount The total amount of SGR in the model.
     */
    function setSgrTotal(uint256 _amount) external;

    /**
     * @dev Get the total amount of SDR in the model.
     * @return The total amount of SDR in the model.
     */
    function getSdrTotal() external view returns (uint256);

    /**
     * @dev Get the total amount of SGR in the model.
     * @return The total amount of SGR in the model.
     */
    function getSgrTotal() external view returns (uint256);
}
