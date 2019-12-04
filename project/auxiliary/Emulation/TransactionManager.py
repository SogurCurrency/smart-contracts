class TransactionManager():
    def __init__(self, _contractAddressLocator):
        self.contractAddressLocator = _contractAddressLocator;

    def buy(self, _ethAmount):
        sdrAmount = self.contractAddressLocator.get('ETHConverter').toSdrAmount(_ethAmount);
        newAmount = self.contractAddressLocator.get('ReconciliationAdjuster').adjustBuy(sdrAmount);
        sgaAmount = self.contractAddressLocator.get('MonetaryModel').buy(newAmount);
        self.contractAddressLocator.get('TransactionLimiter').incTotalBuy(sdrAmount);
        return sgaAmount;

    def sell(self, _sgaAmount):
        sdrAmount = self.contractAddressLocator.get('MonetaryModel').sell(_sgaAmount);
        newAmount = self.contractAddressLocator.get('ReconciliationAdjuster').adjustSell(sdrAmount);
        ethAmount = self.contractAddressLocator.get('ETHConverter').toEthAmount(newAmount);
        self.contractAddressLocator.get('TransactionLimiter').incTotalSell(sdrAmount);
        return ethAmount;
