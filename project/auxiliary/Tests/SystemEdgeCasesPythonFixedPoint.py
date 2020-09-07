import Config


from Common.SystemEdgeCasesPython import run
from ModelCalculator import FixedPoint as modelCalculator
from PriceBandCalculator import FixedPoint as priceBandCalculator
from ReconciliationAdjuster.FixedPoint import ReconciliationAdjuster
from ETHConverter.FixedPoint import ETHConverter


run(Config.Logger(),modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter)