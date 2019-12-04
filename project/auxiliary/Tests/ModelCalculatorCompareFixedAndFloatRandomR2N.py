import Config


from Common.Utils.UserInput import read
from Common.ModelCalculatorCompareFixedAndFloat import run
from Common.ModelCalculatorWrapper import ConvertR2N as conversionHandler
from Common.Utils.InputGenerator import getRandomDistribution as distributionFunc


run(read(default=1000),Config.Logger(),conversionHandler,distributionFunc)