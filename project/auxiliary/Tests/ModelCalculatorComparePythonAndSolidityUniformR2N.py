import Config


from Common.Utils.UserInput import read
from Common.ModelCalculatorComparePythonAndSolidity import run
from Common.ModelCalculatorWrapper import ConvertR2N as conversionHandler
from Common.Utils.InputGenerator import getUniformDistribution as distributionFunc


run(read(default=1000),Config.Logger(),conversionHandler,distributionFunc)