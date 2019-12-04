import Config


from Common.Utils.UserInput import read
from Common.MonetaryModelTradePython import run
from ModelCalculator import FixedPoint as modelCalculator
from PriceBandCalculator import FixedPoint as priceBandCalculator


run(read(default='TradeInputExample.json'),Config.Logger(),modelCalculator,priceBandCalculator)