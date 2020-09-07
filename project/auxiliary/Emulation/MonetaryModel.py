class MonetaryModel():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;

    def buy(self, _sdrAmount):
        monetaryModelState = self.contractAddressLocator.get('MonetaryModelState');
        intervalIterator = self.contractAddressLocator.get('IntervalIterator');

        sgrTotal = monetaryModelState.getSgrTotal();
        (alpha, beta) = intervalIterator.getCurrentIntervalCoefs();
        sdrAmountAfterFee = self.contractAddressLocator.get('PriceBandCalculator').buy(_sdrAmount, sgrTotal, alpha, beta);
        sgrAmount = self.buyFunc(sdrAmountAfterFee, monetaryModelState, intervalIterator);

        return sgrAmount;

    def sell(self, _sgrAmount):
        monetaryModelState = self.contractAddressLocator.get('MonetaryModelState');
        intervalIterator = self.contractAddressLocator.get('IntervalIterator');

        sgrTotal = monetaryModelState.getSgrTotal();
        (alpha, beta) = intervalIterator.getCurrentIntervalCoefs();
        sdrAmountBeforeFee = self.sellFunc(_sgrAmount, monetaryModelState, intervalIterator);
        sdrAmount = self.contractAddressLocator.get('PriceBandCalculator').sell(sdrAmountBeforeFee, sgrTotal, alpha, beta);

        return sdrAmount;

    def buyFunc(self, _sdrAmount, _monetaryModelState, _intervalIterator):
        sgrCount = 0;
        sdrCount = _sdrAmount;

        sdrTotal = _monetaryModelState.getSdrTotal();
        sgrTotal = _monetaryModelState.getSgrTotal();

        (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
        while (sdrCount >= maxR - sdrTotal):
            sdrDelta = maxR - sdrTotal;
            sgrDelta = maxN - sgrTotal;
            _intervalIterator.grow();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sdrTotal = minR;
            sgrTotal = minN;
            sdrCount -= sdrDelta;
            sgrCount += sgrDelta;

        if (sdrCount > 0):
            if (self.contractAddressLocator.get('ModelCalculator').isTrivialInterval(alpha, beta)):
                sgrDelta = self.contractAddressLocator.get('ModelCalculator').getValN(sdrCount, maxN, maxR);
            else:
                sgrDelta = self.contractAddressLocator.get('ModelCalculator').getNewN(sdrTotal + sdrCount, minR, minN, alpha, beta) - sgrTotal;
            sdrTotal += sdrCount;
            sgrTotal += sgrDelta;
            sgrCount += sgrDelta;

        _monetaryModelState.setSdrTotal(sdrTotal);
        _monetaryModelState.setSgrTotal(sgrTotal);

        return sgrCount;

    def sellFunc(self, _sgrAmount, _monetaryModelState, _intervalIterator):
        sdrCount = 0;
        sgrCount = _sgrAmount;

        sgrTotal = _monetaryModelState.getSgrTotal();
        sdrTotal = _monetaryModelState.getSdrTotal();

        (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
        while (sgrCount > sgrTotal - minN):
            sgrDelta = sgrTotal - minN;
            sdrDelta = sdrTotal - minR;
            _intervalIterator.shrink();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sgrTotal = maxN;
            sdrTotal = maxR;
            sgrCount -= sgrDelta;
            sdrCount += sdrDelta;

        if (sgrCount > 0):
            if (self.contractAddressLocator.get('ModelCalculator').isTrivialInterval(alpha, beta)):
                sdrDelta = self.contractAddressLocator.get('ModelCalculator').getValR(sgrCount, maxR, maxN);
            else:
                sdrDelta = sdrTotal - self.contractAddressLocator.get('ModelCalculator').getNewR(sgrTotal - sgrCount, minN, minR, alpha, beta);
            sgrTotal -= sgrCount;
            sdrTotal -= sdrDelta;
            sdrCount += sdrDelta;

        _monetaryModelState.setSgrTotal(sgrTotal);
        _monetaryModelState.setSdrTotal(sdrTotal);

        return sdrCount;
