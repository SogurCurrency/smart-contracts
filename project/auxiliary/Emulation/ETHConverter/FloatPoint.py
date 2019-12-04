from decimal import Decimal

MAX_RESOLUTION = 0x10000000000000000;

class ETHConverter():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;
        self.sequenceNum = 0;
        self.highPriceN = 1;
        self.highPriceD = 1;
        self.lowPriceN = 1;
        self.lowPriceD = 1;

    def setPrice(self, _sequenceNum, _highPriceN, _highPriceD, _lowPriceN, _lowPriceD):
        assert(1 <= _highPriceN and _highPriceN <= MAX_RESOLUTION);
        assert(1 <= _highPriceD and _highPriceD <= MAX_RESOLUTION);
        assert(1 <= _lowPriceN and _lowPriceN <= MAX_RESOLUTION);
        assert(1 <= _lowPriceD and _lowPriceD <= MAX_RESOLUTION);
        assert(_highPriceN * _lowPriceD >= _highPriceD * _lowPriceN);

        if (self.sequenceNum < _sequenceNum):
            self.sequenceNum = _sequenceNum;
            self.highPriceN = _highPriceN;
            self.highPriceD = _highPriceD;
            self.lowPriceN = _lowPriceN;
            self.lowPriceD = _lowPriceD;
            self.contractAddressLocator.get('TransactionLimiter').resetTotal();

    def toSdrAmount(self, _ethAmount):
        return Decimal(_ethAmount) * self.lowPriceN / self.lowPriceD;

    def toEthAmount(self, _sdrAmount):
        return Decimal(_sdrAmount) * self.highPriceD / self.highPriceN;

    def fromEthAmount(self, _ethAmount):
        return Decimal(_ethAmount) * self.highPriceN / self.highPriceD;
