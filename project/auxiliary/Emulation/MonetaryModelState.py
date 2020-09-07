class MonetaryModelState():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;
        self.sdrTotal = 0;
        self.sgrTotal = 0;

    def setSdrTotal(self, _amount):
        self.sdrTotal = _amount;

    def setSgrTotal(self, _amount):
        self.sgrTotal = _amount;

    def getSdrTotal(self):
        return self.sdrTotal;

    def getSgrTotal(self):
        return self.sgrTotal;
