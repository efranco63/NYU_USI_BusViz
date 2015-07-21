#!/usr/bin/env python


###############################################################################
## reduce1-new.py
## find delta distance and time for new speed calculation
## contact: drp354@nyu.edu
###############################################################################

import sys
from datetime import datetime
import math

def get_total_seconds(td): 
    return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 1e6) / 1e6

def main():
    
    start_point = None
    end_point = None
    start_distance = None
    end_distance = None
    prior_id = None
    prior_dir = None
    prior_route = None
    prior_shape = None
    prior_next_stop = None
    prior_time = None
    prior_distance = None

    for line in sys.stdin:
        key, values = line.strip('\n').split('\t')
        key = key.strip().split('|')
        
        busid = key[0]
        direction = key[1]
        route = key[2]
        time_stamp = datetime.strptime(key[3], '%Y-%m-%d %H:%M:%S')
        distance = key[4]
        shape, next_stop = values.strip().split('^')

        if (busid == prior_id) and (direction == prior_dir) and (route == prior_route):
            if (shape != 'NULL' and shape != '' and shape != prior_shape) :
                if start_point != None:
                    end_point = prior_time
                    end_distance = prior_distance
                    delta_time = float(get_total_seconds(end_point - start_point))/3600
                    delta_distance = (float(end_distance) - float(start_distance))/1000
                    if delta_time>0 and delta_distance>0 and delta_time < 1:
                        print "%s\t%s\t%s" % (prior_shape+'|'+prior_next_stop, str(delta_time), str(delta_distance))
                
                start_point = time_stamp
                start_distance = distance
   
            else:
                if shape == 'NULL':
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
        prior_shape = shape
        prior_next_stop = next_stop
        prior_time = time_stamp
        prior_distance = distance


if __name__ == "__main__":
    main()
