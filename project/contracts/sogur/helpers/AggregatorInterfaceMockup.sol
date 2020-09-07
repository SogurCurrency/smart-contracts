pragma solidity 0.4.25;

import "../interfaces/IETHConverter.sol";

contract AggregatorInterfaceMockup {

    int256 private mockedLatestAnswer;

    function setLatestAnswer(int256 _latestAnswer) external {
        mockedLatestAnswer = _latestAnswer;
    }

    function latestAnswer() external view returns (int256) {
        return mockedLatestAnswer;
    }

}
