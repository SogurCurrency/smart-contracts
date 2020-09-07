class TransactionManager():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;

    def buy(self, _ethAmount):
        sdrAmount = self.contractAddressLocator.get('ETHConverter').toSdrAmount(_ethAmount);
        newAmount = self.contractAddressLocator.get('ReconciliationAdjuster').adjustBuy(sdrAmount);
        sgrAmount = self.contractAddressLocator.get('MonetaryModel').buy(newAmount);
        self.contractAddressLocator.get('TransactionLimiter').incTotalBuy(sdrAmount);
        return sgrAmount;

    def sell(self, _sgrAmount):
        sdrAmount = self.contractAddressLocator.get('MonetaryModel').sell(_sgrAmount);
        newAmount = self.contractAddressLocator.get('ReconciliationAdjuster').adjustSell(sdrAmount);
        ethAmount = self.contractAddressLocator.get('ETHConverter').toEthAmount(newAmount);
        self.contractAddressLocator.get('TransactionLimiter').incTotalSell(sdrAmount);
        return ethAmount;
