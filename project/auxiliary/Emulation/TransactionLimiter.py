MAX = 2 ** 256 - 1

class TransactionLimiter():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;
        self.maxBuyDiff = MAX;
        self.maxSellDiff = MAX;
        self.sequenceNum = 0;
        self.totalBuy = 0;
        self.totalSell = 0;

    def setMaxDiff(self, _sequenceNum, _maxBuyDiff, _maxSellDiff):
        if (self.sequenceNum < _sequenceNum):
            self.sequenceNum = _sequenceNum;
            self.maxBuyDiff = _maxBuyDiff;
            self.maxSellDiff = _maxSellDiff;


    def resetTotal(self):
        self.totalBuy = 0;
        self.totalSell = 0;

    def incTotalBuy(self, _amount):
        self.totalBuy += _amount;
        if (self.totalBuy > self.totalSell):
            assert(self.totalBuy - self.totalSell <= self.maxBuyDiff);

    def incTotalSell(self, _amount):
        self.totalSell += _amount;
        if (self.totalSell > self.totalBuy):
            assert(self.totalSell - self.totalBuy <= self.maxSellDiff);
