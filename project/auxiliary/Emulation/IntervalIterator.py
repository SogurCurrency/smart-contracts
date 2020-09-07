class IntervalIterator():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;
        self.row = 0;
        self.col = 0;

    def grow(self):
        if (self.col == 0):
            self.row += 1;
            self.contractAddressLocator.get('MintingPointTimersManager').start(self.row);
        else:
            self.col -= 1;

    def shrink(self):
        mintingPointTimersManager = self.contractAddressLocator.get('MintingPointTimersManager');
        if (mintingPointTimersManager.running(self.row)):
            mintingPointTimersManager.reset(self.row);
            assert(self.row > 0);
            self.row -= 1;
        else:
            self.col += 1;

    def getCurrentInterval(self):
        return self.contractAddressLocator.get('ModelDataSource').getInterval(self.row, self.col);

    def getCurrentIntervalCoefs(self):
        return self.contractAddressLocator.get('ModelDataSource').getIntervalCoefs(self.row, self.col);
