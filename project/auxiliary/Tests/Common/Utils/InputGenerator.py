from random import randrange


def getRandomDistribution(minimumValue,maximumValue,samplesCount):
    return sorted([randrange(minimumValue,maximumValue) for n in range(samplesCount)])


def getUniformDistribution(minimumValue,maximumValue,samplesCount):
    return [minimumValue+n*(maximumValue-minimumValue)//(samplesCount-1) for n in range(samplesCount)]
