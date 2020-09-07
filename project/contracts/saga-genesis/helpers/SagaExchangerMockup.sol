pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../interfaces/ISagaExchanger.sol";

contract SagaExchangerMockup is ISagaExchanger, ERC20 {
    address public constant SGR_MINTED_FOR_SGN_HOLDERS = address(keccak256("SGR_MINTED_FOR_SGN_HOLDERS"));

    function mintSgaForSgnHolders(uint256 _value) external {
        _mint(SGR_MINTED_FOR_SGN_HOLDERS, _value);
    }

    function transferSgaToSgnHolder(address _to, uint256 _value) external {
        _transfer(SGR_MINTED_FOR_SGN_HOLDERS, _to, _value);
    }
}
