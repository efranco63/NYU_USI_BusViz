from pandas import DataFrame as df
import csv
from datetime import datetime as dt
import datetime
import time
lookuptable={}
def records(path):
    with open(path) as f:
        contents = f.read()
        return (record for record in contents.split('\t\n'))
def parser(item):
    try:
        x=time.strptime(item,'%H:%M:%S')
        seconds=datetime.timedelta(hours=x.tm_hour,minutes=x.tm_min,seconds=x.tm_sec).total_seconds()
        return seconds
    except:
        return 0

def main():
    csvfile=csv.reader(records('waittimes2_n'),delimiter='|')
    for row in csvfile: 
        try:
            if row[0] not in lookuptable:
                lookuptable[row[0]]={}
                lookuptable[row[0]][row[1]]=[]
            else:
                if row[1] not in lookuptable[row[0]]:
                    lookuptable[row[0]][row[1]]=[]
            for item in row[2:]:
                xlist=item.strip().split(',')
                xlist=map(parser,xlist)
                lookuptable[row[0]][row[1]].append(xlist)
        except:
            pass


if __name__ == '__main__':
    main()

import json
with open('dummy.json','w') as f:
    json.dump(lookuptable, f)
# import cPickle as pickle
# pickle.dump(lookuptable, open( "save.p", "wb" ) )
