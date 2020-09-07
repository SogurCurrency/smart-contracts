import Config


from Common.SystemEdgeCasesPython import run
from ModelCalculator import FloatPoint as modelCalculator
from PriceBandCalculator import FloatPoint as priceBandCalculator
from ReconciliationAdjuster.FloatPoint import ReconciliationAdjuster
from ETHConverter.FloatPoint import ETHConverter


run(Config.Logger(),modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter)