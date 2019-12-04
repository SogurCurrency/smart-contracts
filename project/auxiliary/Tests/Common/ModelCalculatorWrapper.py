class Convert():
    def __init__(self,modelCalculator):
        self.isTrivialInterval = modelCalculator.isTrivialInterval
    def SetIntervalTypeInternally(self,alpha,beta):
        self.trivial = self.isTrivialInterval(alpha,beta)
    def SetIntervalTypeExternally(self,modelCalculator,alpha,beta):
        self.trivial = modelCalculator.isTrivialInterval(alpha,beta)


class ConvertR2N(Convert):
    def __init__(self,modelCalculator):
        super().__init__(modelCalculator)
        self.getValN = modelCalculator.getValN
        self.getNewN = modelCalculator.getNewN
    def inputRange(minN,maxN,minR,maxR):
        return minR,maxR
    def outputFunc(self,newR,minN,maxN,minR,maxR,alpha,beta):
        return self.getValN(newR-minR,maxN,maxR) if self.trivial else self.getNewN(newR,minR,minN,alpha,beta)


class ConvertN2R(Convert):
    def __init__(self,modelCalculator):
        super().__init__(modelCalculator)
        self.getValR = modelCalculator.getValR
        self.getNewR = modelCalculator.getNewR
    def inputRange(minN,maxN,minR,maxR):
        return minN,maxN
    def outputFunc(self,newN,minN,maxN,minR,maxR,alpha,beta):
        return self.getValR(newN-minN,maxR,maxN) if self.trivial else self.getNewR(newN,minN,minR,alpha,beta)
