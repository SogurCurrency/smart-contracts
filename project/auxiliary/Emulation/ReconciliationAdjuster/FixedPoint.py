MAX_RESOLUTION = 0x10000000000000000;

class ReconciliationAdjuster():
    def __init__(self):
        self.sequenceNum = 0;
        self.factorN = 1;
        self.factorD = 1;

    def setFactor(self, _sequenceNum, _factorN, _factorD):
        assert(1 <= _factorN and _factorN <= MAX_RESOLUTION);
        assert(1 <= _factorD and _factorD <= MAX_RESOLUTION);

        if (self.sequenceNum < _sequenceNum):
            self.sequenceNum = _sequenceNum;
            self.factorN = _factorN;
            self.factorD = _factorD;

    def adjustBuy(self, _sdrAmount):
        return _sdrAmount * self.factorD // self.factorN;

    def adjustSell(self, _sdrAmount):
        return _sdrAmount * self.factorN // self.factorD;
