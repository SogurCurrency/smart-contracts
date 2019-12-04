import Config


from Common.Utils.UserInput import read
from Common.SGATokenTradePython import run
from ModelCalculator import FixedPoint as modelCalculator
from PriceBandCalculator import FixedPoint as priceBandCalculator
from ReconciliationAdjuster.FixedPoint import ReconciliationAdjuster
from ETHConverter.FixedPoint import ETHConverter


run(read(default='TradeInputExample.json'),Config.Logger(),modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter)