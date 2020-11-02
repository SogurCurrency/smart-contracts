pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title SGA to SGR Token Exchange.
 */
contract SGAToSGRTokenExchange {
    string public constant VERSION = "1.0.0";

    using Math for uint256;
    // Exchanged SGA tokens are transferred to this address. The zero address can not be used as transfer to this address will revert.
    address public constant SGA_TARGET_ADDRESS = address(1);

    IERC20 public sgaToken;
    IERC20 public sgrToken;

    event ExchangeSgaForSgrCompleted(address indexed _sgaHolder, uint256 _exchangedAmount);

    /**
     * @dev Create the contract.
     * @param _sgaTokenAddress The SGA token contract address.
     * @param _sgrTokenAddress The SGR token contract address.
     */
    constructor(address _sgaTokenAddress, address _sgrTokenAddress) public {
        require(_sgaTokenAddress != address(0), "SGA token address is illegal");
        require(_sgrTokenAddress != address(0), "SGR token address is illegal");

        sgaToken = IERC20(_sgaTokenAddress);
        sgrToken = IERC20(_sgrTokenAddress);
    }


    /**
     * @dev Exchange SGA to SGR.
     */
    function exchangeSGAtoSGR() external {
        handleExchangeSGAtoSGRFor(msg.sender);
    }

    /**
     * @dev Exchange SGA to SGR for a given sga holder.
     * @param _sgaHolder The sga holder address.
     */
    function exchangeSGAtoSGRFor(address _sgaHolder) external {
        require(_sgaHolder != address(0), "SGA holder address is illegal");
        handleExchangeSGAtoSGRFor(_sgaHolder);
    }

    /**
     * @dev Handle the SGA to SGR exchange.
     */
    function handleExchangeSGAtoSGRFor(address _sgaHolder) internal {
        uint256 allowance = sgaToken.allowance(_sgaHolder, address(this));
        require(allowance > 0, "SGA allowance must be greater than zero");
        uint256 balance = sgaToken.balanceOf(_sgaHolder);
        require(balance > 0, "SGA balance must be greater than zero");
        uint256 amountToExchange = allowance.min(balance);

        sgaToken.transferFrom(_sgaHolder, SGA_TARGET_ADDRESS, amountToExchange);
        sgrToken.transfer(_sgaHolder, amountToExchange);
        emit ExchangeSgaForSgrCompleted(_sgaHolder, amountToExchange);
    }
}
