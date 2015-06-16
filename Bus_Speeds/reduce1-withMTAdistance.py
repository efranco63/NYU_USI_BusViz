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
    start_distance = None
    end_distance = None
    prior_id = None
    prior_dir = None
    prior_route = None
    prior_stop = None
    prior_time = None
    prior_distance = None

    for line in sys.stdin:

        key,values = line.strip('\n').split('\t')
        key = key.strip().split('|')

        busid = key[0]
        direction = key[1]
        route = key[2]
        time_stamp = datetime.strptime(key[3],'%Y-%m-%d %H:%M:%S')
        distance = key[4]
        stop = values[4:]

        if route == 'MTA NYCT_B38' and direction == '0':

            if (busid == prior_id) and (direction == prior_dir) and (route == prior_route):
                if stop != 'NULL' and stop != '' and stop != prior_stop:
                    if start_point != None:
                        end_point = prior_time
                        end_distance = prior_distance
                        delta_time = (end_point-start_point).total_seconds()
                        delta_distance = float(start_distance) - float(end_distance)
                        if delta_time != 0 and delta_distance > 0:
                            print "%s|%s|%s\t%s\t%s\t" % (prior_route, prior_stop, prior_dir, str(delta_time), str(delta_distance))
                            #print "%s|%s|%s\t%s\t%s\t%s,%s" % (prior_route, prior_stop, prior_dir, str(delta_time), str(delta_distance),\
                            #                              start_point.strftime("%Y-%m-%d %H:%M:%S"), end_point.strftime("%Y-%m-%d %H:%M:%S"))
                    start_point = time_stamp
                    start_distance = distance
                else:
                    if stop == 'NULL':
                        start_point = None
                        end_point = None
                        start_distance = None
                        end_distance = None
            else:
                start_point = None
                end_point = None
                start_distance = None
                end_distance = None

            prior_id = busid
            prior_dir = direction
            prior_route = route
            prior_stop = stop
            prior_time = time_stamp
            prior_distance = distance

if __name__ == "__main__":
    main()

