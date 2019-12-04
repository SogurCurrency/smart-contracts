from json import loads


def load(fileName):
    fileDesc = open(fileName)
    fileData = fileDesc.read()
    fileDesc.close()
    return loads(fileData)
