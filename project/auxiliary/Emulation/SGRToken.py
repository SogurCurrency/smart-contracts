MIN = 0
MAX = 2 ** 256 - 1

class SGRToken():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator
        self.ethTotal = 0
        self.sgrTotal = 0

    def buy(self, _ethAmount):
        sgrAmount = self.contractAddressLocator.get('TransactionManager').buy(_ethAmount)
        self.ethTotal += _ethAmount
        self.sgrTotal +=  sgrAmount
        assert self.ethTotal <= MAX
        assert self.sgrTotal <= MAX
        return sgrAmount

    def sell(self, _sgrAmount):
        ethAmount = self.contractAddressLocator.get('TransactionManager').sell(_sgrAmount)
        self.ethTotal -=  ethAmount
        self.sgrTotal -= _sgrAmount
        assert self.ethTotal >= MIN
        assert self.sgrTotal >= MIN
        return ethAmount

    def mintSgrForSgnHolders(self, _sgrAmount):
        self.sgrTotal += _sgrAmount
        assert self.sgrTotal <= MAX

    def transferSgrToSgnHolder(self, _sgrAmount):
        self.sgrTotal -= _sgrAmount
        assert self.sgrTotal >= MIN
