class MonetaryModelState():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;
        self.sdrTotal = 0;
        self.sgaTotal = 0;

    def setSdrTotal(self, _amount):
        self.sdrTotal = _amount;

    def setSgaTotal(self, _amount):
        self.sgaTotal = _amount;

    def getSdrTotal(self):
        return self.sdrTotal;

    def getSgaTotal(self):
        return self.sgaTotal;
