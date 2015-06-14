#!/usr/bin/env python

###############################################################################
## reduce1.py
## mapper for calculating bus speed (naive method)
## contact: drp354@nyu.edu
###############################################################################

import sys
from datetime import datetime


def main():

    start_point = None
    end_point = None
    prior_id = None
    prior_dir = None
    prior_route = None
    prior_stop = None
    prior_time = None

    for line in sys.stdin:

        # only for debug
        line = line.strip('\n')
        key,values = line.split('\t')
        key = key.strip().split('|')

        busid = key[0]
        direction = key[1]
        route = key[2]
        time_stamp = datetime.strptime(key[3],'%Y-%m-%d %H:%M:%S')
        stop = values[4:]

        if route == 'MTA NYCT_B38' and direction == '0':

            #print '|'.join(key)+'\t'+stop
 
            if (busid == prior_id) and (direction == prior_dir) and (route == prior_route):
                if stop != 'NULL' and stop != '' and stop != prior_stop:
                    if start_point != None:
                        end_point = prior_time
                        delta = (end_point-start_point).total_seconds()
                        print "%s|%s|%s\t%s\t%s,%s" % (prior_route, prior_stop, prior_dir, str(delta), start_point.strftime("%Y-%m-%d %H:%M:%S"), end_point.strftime("%Y-%m-%d %H:%M:%S"))
                    start_point = time_stamp
                else:
                    if stop == 'NULL':
                        start_point = None
                        end_point = None
            else:
                start_point = None
                end_point = None
            prior_id = busid
            prior_dir = direction
            prior_route = route
            prior_stop = stop
            prior_time = time_stamp

        # only for debug
        # if key[0] == 'MTA NYCT_B38' and key[2] == '0':
        #print '|'.join(key)+'\t'+values

if __name__ == "__main__":
    main()
