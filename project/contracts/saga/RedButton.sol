pragma solidity 0.4.25;

import "./interfaces/IRedButton.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Red Button.
 */
contract RedButton is IRedButton, Claimable {
    string public constant VERSION = "1.0.0";

    bool public enabled;

    event RedButtonEnabledSaved(bool _enabled);

    /**
     * @dev Get the state of the red-button.
     * @return The state of the red-button.
     */
    function isEnabled() external view returns (bool) {
        return enabled;
    }

    /**
     * @dev Set the state of the red-button.
     * @param _enabled The state of the red-button.
     */
    function setEnabled(bool _enabled) external onlyOwner {
        enabled = _enabled;
        emit RedButtonEnabledSaved(_enabled);
    }
}
