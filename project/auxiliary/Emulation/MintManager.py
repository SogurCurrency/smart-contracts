class MintManager():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;
        self.index = 0;

    def isMintingStateOutdated(self):
        return self.contractAddressLocator.get('MintingPointTimersManager').expired(self.index + 1);

    def updateMintingState(self):
        if (self.isMintingStateOutdated()):
            amount = self.contractAddressLocator.get('ModelDataSource').getRequiredMintAmount(self.index);
            self.contractAddressLocator.get('MintListener').mintSgrForSgnHolders(amount);
            self.index += 1;

    def getIndex(self):
        return self.index;
