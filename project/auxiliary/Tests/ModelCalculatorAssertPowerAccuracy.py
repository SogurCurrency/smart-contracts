import Config


from Common.Utils.UserInput import read
from Common.ModelCalculatorAssertPowerAccuracy import run


run(read(default=100),Config.Logger())