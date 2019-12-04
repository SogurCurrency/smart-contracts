class MonetaryModel():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;

    def buy(self, _sdrAmount):
        monetaryModelState = self.contractAddressLocator.get('MonetaryModelState');
        intervalIterator = self.contractAddressLocator.get('IntervalIterator');

        sgaTotal = monetaryModelState.getSgaTotal();
        (alpha, beta) = intervalIterator.getCurrentIntervalCoefs();
        sdrAmountAfterFee = self.contractAddressLocator.get('PriceBandCalculator').buy(_sdrAmount, sgaTotal, alpha, beta);
        sgaAmount = self.buyFunc(sdrAmountAfterFee, monetaryModelState, intervalIterator);

        return sgaAmount;

    def sell(self, _sgaAmount):
        monetaryModelState = self.contractAddressLocator.get('MonetaryModelState');
        intervalIterator = self.contractAddressLocator.get('IntervalIterator');

        sgaTotal = monetaryModelState.getSgaTotal();
        (alpha, beta) = intervalIterator.getCurrentIntervalCoefs();
        sdrAmountBeforeFee = self.sellFunc(_sgaAmount, monetaryModelState, intervalIterator);
        sdrAmount = self.contractAddressLocator.get('PriceBandCalculator').sell(sdrAmountBeforeFee, sgaTotal, alpha, beta);

        return sdrAmount;

    def buyFunc(self, _sdrAmount, _monetaryModelState, _intervalIterator):
        sgaCount = 0;
        sdrCount = _sdrAmount;

        sdrTotal = _monetaryModelState.getSdrTotal();
        sgaTotal = _monetaryModelState.getSgaTotal();

        (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
        while (sdrCount >= maxR - sdrTotal):
            sdrDelta = maxR - sdrTotal;
            sgaDelta = maxN - sgaTotal;
            _intervalIterator.grow();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sdrTotal = minR;
            sgaTotal = minN;
            sdrCount -= sdrDelta;
            sgaCount += sgaDelta;

        if (sdrCount > 0):
            if (self.contractAddressLocator.get('ModelCalculator').isTrivialInterval(alpha, beta)):
                sgaDelta = self.contractAddressLocator.get('ModelCalculator').getValN(sdrCount, maxN, maxR);
            else:
                sgaDelta = self.contractAddressLocator.get('ModelCalculator').getNewN(sdrTotal + sdrCount, minR, minN, alpha, beta) - sgaTotal;
            sdrTotal += sdrCount;
            sgaTotal += sgaDelta;
            sgaCount += sgaDelta;

        _monetaryModelState.setSdrTotal(sdrTotal);
        _monetaryModelState.setSgaTotal(sgaTotal);

        return sgaCount;

    def sellFunc(self, _sgaAmount, _monetaryModelState, _intervalIterator):
        sdrCount = 0;
        sgaCount = _sgaAmount;

        sgaTotal = _monetaryModelState.getSgaTotal();
        sdrTotal = _monetaryModelState.getSdrTotal();

        (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
        while (sgaCount > sgaTotal - minN):
            sgaDelta = sgaTotal - minN;
            sdrDelta = sdrTotal - minR;
            _intervalIterator.shrink();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sgaTotal = maxN;
            sdrTotal = maxR;
            sgaCount -= sgaDelta;
            sdrCount += sdrDelta;

        if (sgaCount > 0):
            if (self.contractAddressLocator.get('ModelCalculator').isTrivialInterval(alpha, beta)):
                sdrDelta = self.contractAddressLocator.get('ModelCalculator').getValR(sgaCount, maxR, maxN);
            else:
                sdrDelta = sdrTotal - self.contractAddressLocator.get('ModelCalculator').getNewR(sgaTotal - sgaCount, minN, minR, alpha, beta);
            sgaTotal -= sgaCount;
            sdrTotal -= sdrDelta;
            sdrCount += sdrDelta;

        _monetaryModelState.setSgaTotal(sgaTotal);
        _monetaryModelState.setSdrTotal(sdrTotal);

        return sdrCount;
