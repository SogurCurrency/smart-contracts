pragma solidity 0.4.25;

contract SGAMonetaryModelStateMockup  {
    uint256 private sdrTotal;
    uint256 private sgaTotal;

    function setSdrTotal(uint256 _amount) external {
        sdrTotal = _amount;
    }

    function setSgaTotal(uint256 _amount) external {
        sgaTotal = _amount;
    }

    function getSdrTotal() external view returns (uint256) {
        return sdrTotal;
    }

    function getSgaTotal() external view returns (uint256) {
        return sgaTotal;
    }
}
