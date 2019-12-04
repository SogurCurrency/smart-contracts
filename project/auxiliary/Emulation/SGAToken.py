MIN = 0
MAX = 2 ** 256 - 1

class SGAToken():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator
        self.ethTotal = 0
        self.sgaTotal = 0

    def buy(self, _ethAmount):
        sgaAmount = self.contractAddressLocator.get('TransactionManager').buy(_ethAmount)
        self.ethTotal += _ethAmount
        self.sgaTotal +=  sgaAmount
        assert self.ethTotal <= MAX
        assert self.sgaTotal <= MAX
        return sgaAmount

    def sell(self, _sgaAmount):
        ethAmount = self.contractAddressLocator.get('TransactionManager').sell(_sgaAmount)
        self.ethTotal -=  ethAmount
        self.sgaTotal -= _sgaAmount
        assert self.ethTotal >= MIN
        assert self.sgaTotal >= MIN
        return ethAmount

    def mintSgaForSgnHolders(self, _sgaAmount):
        self.sgaTotal += _sgaAmount
        assert self.sgaTotal <= MAX

    def transferSgaToSgnHolder(self, _sgaAmount):
        self.sgaTotal -= _sgaAmount
        assert self.sgaTotal >= MIN
