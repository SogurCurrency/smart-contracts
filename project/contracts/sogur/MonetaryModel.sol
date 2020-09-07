pragma solidity 0.4.25;

import "./interfaces/IMonetaryModel.sol";
import "./interfaces/IMonetaryModelState.sol";
import "./interfaces/IModelCalculator.sol";
import "./interfaces/IPriceBandCalculator.sol";
import "./interfaces/IIntervalIterator.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Monetary Model.
 */
contract MonetaryModel is IMonetaryModel, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.1";

    using SafeMath for uint256;

    uint256 public constant MIN_RR  = 1000000000000000000000000000000000;
    uint256 public constant MAX_RR  = 10000000000000000000000000000000000;

    event MonetaryModelBuyCompleted(uint256 _input, uint256 _output);
    event MonetaryModelSellCompleted(uint256 _input, uint256 _output);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IMonetaryModelState interface.
     */
    function getMonetaryModelState() public view returns (IMonetaryModelState) {
        return IMonetaryModelState(getContractAddress(_IMonetaryModelState_));
    }

    /**
     * @dev Return the contract which implements the IModelCalculator interface.
     */
    function getModelCalculator() public view returns (IModelCalculator) {
        return IModelCalculator(getContractAddress(_IModelCalculator_));
    }

    /**
     * @dev Return the contract which implements the IPriceBandCalculator interface.
     */
    function getPriceBandCalculator() public view returns (IPriceBandCalculator) {
        return IPriceBandCalculator(getContractAddress(_IPriceBandCalculator_));
    }

    /**
     * @dev Return the contract which implements the IIntervalIterator interface.
     */
    function getIntervalIterator() public view returns (IIntervalIterator) {
        return IIntervalIterator(getContractAddress(_IIntervalIterator_));
    }

    /**
     * @dev Buy SGR in exchange for SDR.
     * @param _sdrAmount The amount of SDR received from the buyer.
     * @return The amount of SGR that the buyer is entitled to receive.
     */
    function buy(uint256 _sdrAmount) external only(_ITransactionManager_) returns (uint256) {
        IMonetaryModelState monetaryModelState = getMonetaryModelState();
        IIntervalIterator intervalIterator = getIntervalIterator();

        uint256 sgrTotal = monetaryModelState.getSgrTotal();
        (uint256 alpha, uint256 beta) = intervalIterator.getCurrentIntervalCoefs();
        uint256 reserveRatio = alpha.sub(beta.mul(sgrTotal));
        assert(MIN_RR <= reserveRatio && reserveRatio <= MAX_RR);
        uint256 sdrAmountAfterFee = getPriceBandCalculator().buy(_sdrAmount, sgrTotal, alpha, beta);
        uint256 sgrAmount = buyFunc(sdrAmountAfterFee, monetaryModelState, intervalIterator);

        emit MonetaryModelBuyCompleted(_sdrAmount, sgrAmount);
        return sgrAmount;
    }

    /**
     * @dev Sell SGR in exchange for SDR.
     * @param _sgrAmount The amount of SGR received from the seller.
     * @return The amount of SDR that the seller is entitled to receive.
     */
    function sell(uint256 _sgrAmount) external only(_ITransactionManager_) returns (uint256) {
        IMonetaryModelState monetaryModelState = getMonetaryModelState();
        IIntervalIterator intervalIterator = getIntervalIterator();

        uint256 sgrTotal = monetaryModelState.getSgrTotal();
        (uint256 alpha, uint256 beta) = intervalIterator.getCurrentIntervalCoefs();
        uint256 reserveRatio = alpha.sub(beta.mul(sgrTotal));
        assert(MIN_RR <= reserveRatio && reserveRatio <= MAX_RR);
        uint256 sdrAmountBeforeFee = sellFunc(_sgrAmount, monetaryModelState, intervalIterator);
        uint256 sdrAmount = getPriceBandCalculator().sell(sdrAmountBeforeFee, sgrTotal, alpha, beta);

        emit MonetaryModelSellCompleted(_sgrAmount, sdrAmount);
        return sdrAmount;
    }

    /**
     * @dev Execute the SDR-to-SGR algorithm.
     * @param _sdrAmount The amount of SDR.
     * @return The equivalent amount of SGR.
     * @notice The two additional parameters can also be retrieved inside the function.
     * @notice They are passed from the outside, however, in order to improve performance and reduce the cost.
     * @notice Another parameter is retrieved inside the function due to a technical limitation, namely, insufficient stack size.
     */
    function buyFunc(uint256 _sdrAmount, IMonetaryModelState _monetaryModelState, IIntervalIterator _intervalIterator) private returns (uint256) {
        uint256 sgrCount = 0;
        uint256 sdrCount = _sdrAmount;

        uint256 sdrDelta;
        uint256 sgrDelta;

        uint256 sdrTotal = _monetaryModelState.getSdrTotal();
        uint256 sgrTotal = _monetaryModelState.getSgrTotal();

        //Gas consumption is capped, since according to the parameters of the Sogur monetary model the execution of more than one iteration of this loop involves transaction of tens (or more) of millions of SDR worth of ETH and are thus unlikely.
        (uint256 minN, uint256 maxN, uint256 minR, uint256 maxR, uint256 alpha, uint256 beta) = _intervalIterator.getCurrentInterval();
        while (sdrCount >= maxR.sub(sdrTotal)) {
            sdrDelta = maxR.sub(sdrTotal);
            sgrDelta = maxN.sub(sgrTotal);
            _intervalIterator.grow();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sdrTotal = minR;
            sgrTotal = minN;
            sdrCount = sdrCount.sub(sdrDelta);
            sgrCount = sgrCount.add(sgrDelta);
        }

        if (sdrCount > 0) {
            if (getModelCalculator().isTrivialInterval(alpha, beta))
                sgrDelta = getModelCalculator().getValN(sdrCount, maxN, maxR);
            else
                sgrDelta = getModelCalculator().getNewN(sdrTotal.add(sdrCount), minR, minN, alpha, beta).sub(sgrTotal);
            sdrTotal = sdrTotal.add(sdrCount);
            sgrTotal = sgrTotal.add(sgrDelta);
            sgrCount = sgrCount.add(sgrDelta);
        }

        _monetaryModelState.setSdrTotal(sdrTotal);
        _monetaryModelState.setSgrTotal(sgrTotal);

        return sgrCount;
    }

    /**
     * @dev Execute the SGR-to-SDR algorithm.
     * @param _sgrAmount The amount of SGR.
     * @return The equivalent amount of SDR.
     * @notice The two additional parameters can also be retrieved inside the function.
     * @notice They are passed from the outside, however, in order to improve performance and reduce the cost.
     * @notice Another parameter is retrieved inside the function due to a technical limitation, namely, insufficient stack size.
     */
    function sellFunc(uint256 _sgrAmount, IMonetaryModelState _monetaryModelState, IIntervalIterator _intervalIterator) private returns (uint256) {
        uint256 sdrCount = 0;
        uint256 sgrCount = _sgrAmount;

        uint256 sgrDelta;
        uint256 sdrDelta;

        uint256 sgrTotal = _monetaryModelState.getSgrTotal();
        uint256 sdrTotal = _monetaryModelState.getSdrTotal();

        //Gas consumption is capped, since according to the parameters of the Sogur monetary model the execution of more than one iteration of this loop involves transaction of tens (or more) of millions of SDR worth of ETH and are thus unlikely.
        (uint256 minN, uint256 maxN, uint256 minR, uint256 maxR, uint256 alpha, uint256 beta) = _intervalIterator.getCurrentInterval();
        while (sgrCount > sgrTotal.sub(minN)) {
            sgrDelta = sgrTotal.sub(minN);
            sdrDelta = sdrTotal.sub(minR);
            _intervalIterator.shrink();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sgrTotal = maxN;
            sdrTotal = maxR;
            sgrCount = sgrCount.sub(sgrDelta);
            sdrCount = sdrCount.add(sdrDelta);
        }

        if (sgrCount > 0) {
            if (getModelCalculator().isTrivialInterval(alpha, beta))
                sdrDelta = getModelCalculator().getValR(sgrCount, maxR, maxN);
            else
                sdrDelta = sdrTotal.sub(getModelCalculator().getNewR(sgrTotal.sub(sgrCount), minN, minR, alpha, beta));
            sgrTotal = sgrTotal.sub(sgrCount);
            sdrTotal = sdrTotal.sub(sdrDelta);
            sdrCount = sdrCount.add(sdrDelta);
        }

        _monetaryModelState.setSgrTotal(sgrTotal);
        _monetaryModelState.setSdrTotal(sdrTotal);

        return sdrCount;
    }
}
