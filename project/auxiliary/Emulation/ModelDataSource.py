class ModelDataSource():
    class Interval():
        def __init__(self, _minN, _maxN, _minR, _maxR, _alpha, _beta):
            self.minN = _minN;
            self.maxN = _maxN;
            self.minR = _minR;
            self.maxR = _maxR;
            self.alpha = _alpha;
            self.beta = _beta;

    def __init__(self):
        self.intervalListsLocked = False;
        self.intervalLists = [[ModelDataSource.Interval(0, 0, 0, 0, 0, 0) for c in range(11)] for r in range(95)];

    def lock(self):
        self.intervalListsLocked = True;

    def setInterval(self, _rowNum, _colNum, _minN, _maxN, _minR, _maxR, _alpha, _beta):
        assert(not self.intervalListsLocked);
        self.intervalLists[_rowNum][_colNum] = ModelDataSource.Interval(_minN, _maxN, _minR, _maxR, _alpha, _beta);

    def getInterval(self, _rowNum, _colNum):
        interval = self.intervalLists[_rowNum][_colNum];
        return (interval.minN, interval.maxN, interval.minR, interval.maxR, interval.alpha, interval.beta);

    def getIntervalCoefs(self, _rowNum, _colNum):
        interval = self.intervalLists[_rowNum][_colNum];
        return (interval.alpha, interval.beta);

    def getRequiredMintAmount(self, _rowNum):
        currMaxN = self.intervalLists[_rowNum + 0][0].maxN;
        nextMinN = self.intervalLists[_rowNum + 1][0].minN;
        assert(nextMinN >= currMaxN);
        return nextMinN - currMaxN;
