from constants import denomination
from constants import mintedTokens


keys = sorted(mintedTokens.keys())
vals = [mintedTokens[key] for key in keys]


max_key_len = len(str(max(keys)))
max_val_len = len(str(max(vals)))


print('    uint8  public constant decimals = {};'.format(denomination))
print('')
print('')
for key,val in zip(keys,vals):
    if key == 0:
        print('        _mint(initialOwner, {} * oneToken);'.format(val))
    else:
        print('        valueMintedAt[{0:{1}d}] = {2:{3}d} * oneToken;'.format(key,max_key_len,val,max_val_len))
