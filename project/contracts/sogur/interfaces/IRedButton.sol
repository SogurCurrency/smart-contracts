pragma solidity 0.4.25;

/**
 * @title Red Button Interface.
 */
interface IRedButton {
    /**
     * @dev Get the state of the red-button.
     * @return The state of the red-button.
     */
    function isEnabled() external view returns (bool);
}
