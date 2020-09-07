import Config


from Common.Utils.UserInput import read
from Common.MonetaryModelTradePython import run
from ModelCalculator import FloatPoint as modelCalculator
from PriceBandCalculator import FloatPoint as priceBandCalculator


run(read(default='TradeInputExample.json'),Config.Logger(),modelCalculator,priceBandCalculator)