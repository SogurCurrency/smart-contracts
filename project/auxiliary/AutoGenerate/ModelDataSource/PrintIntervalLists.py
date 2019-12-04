import sys
sys.path.append('../../Tests')
from Common.ModelDataSource import intervalLists


max_minN  = 0
max_maxN  = 0
max_minR  = 0
max_maxR  = 0
max_alpha = 0
max_beta  = 0


for intervalList in intervalLists:
    for minN,maxN,minR,maxR,alpha,beta in intervalList:
        max_minN  = max(max_minN ,minN )
        max_maxN  = max(max_maxN ,maxN )
        max_minR  = max(max_minR ,minR )
        max_maxR  = max(max_maxR ,maxR )
        max_alpha = max(max_alpha,alpha)
        max_beta  = max(max_beta ,beta )


len_minN  = len(str(max_minN ))
len_maxN  = len(str(max_maxN ))
len_minR  = len(str(max_minR ))
len_maxR  = len(str(max_maxR ))
len_alpha = len(str(max_alpha))
len_beta  = len(str(max_beta ))


print('intervalLists = [')
for intervalList in intervalLists:
    print('    [')
    for minN,maxN,minR,maxR,alpha,beta in intervalList:
        print('        ["{0:{6}}", "{1:{7}}", "{2:{8}}", "{3:{9}}", "{4:{10}}", "{5:{11}}"],'.format(minN,maxN,minR,maxR,alpha,beta,len_minN,len_maxN,len_minR,len_maxR,len_alpha,len_beta))
    print('    ],')
print('];')
