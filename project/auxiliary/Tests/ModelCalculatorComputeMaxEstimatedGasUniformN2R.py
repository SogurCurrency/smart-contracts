import Config


from Common.Utils.UserInput import read
from Common.ModelCalculatorComputeMaxEstimatedGas import run
from Common.ModelCalculatorWrapper import ConvertN2R as conversionHandler
from Common.Utils.InputGenerator import getUniformDistribution as distributionFunc


run(read(default=1000),Config.Logger(),conversionHandler,distributionFunc)