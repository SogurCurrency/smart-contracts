pragma solidity 0.4.25;

import "../interfaces/IRedButton.sol";

contract RedButtonMockup is IRedButton {
    bool private enabled;

    function setEnabled(bool _enabled) external {
        enabled = _enabled;
    }

    function isEnabled() external view returns (bool) {
        return enabled;
    }
}
