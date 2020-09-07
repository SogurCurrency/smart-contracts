import Config


from Common.Utils.UserInput import read
from Common.SGRTokenTradePython import run
from ModelCalculator import FloatPoint as modelCalculator
from PriceBandCalculator import FloatPoint as priceBandCalculator
from ReconciliationAdjuster.FloatPoint import ReconciliationAdjuster
from ETHConverter.FloatPoint import ETHConverter


run(read(default='TradeInputExample.json'),Config.Logger(),modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter)