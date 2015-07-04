#!/usr/bin/env python


###############################################################################
## reduce1.py
## find distance and tip for each tripid
## contact: drp354@nyu.edu
###############################################################################

import sys
from datetime import datetime
import math

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
    prior_tripid = None

    for line in sys.stdin:
        key, values = line.strip('\n').split('\t')
        key = key.strip().split('|')
        
        busid = key[0]
        direction = key[1]
        route = key[2]
        time_stamp = datetime.strptime(key[3], '%Y-%m-%d %H:%M:%S')
        distance = key[4]
        tripid = key[5]
        stop = values[4:]
      
        if (busid == prior_id) and (direction == prior_dir) and (route == prior_route):
            if (stop != 'NULL' and stop != '' and stop != prior_stop) or (tripid != prior_tripid) :
                if start_point != None:
                    end_point = prior_time
                    end_distance = prior_distance
                    delta_time = ((end_point - start_point).total_seconds())/3600
                    delta_distance = (float(start_distance) - float(end_distance))/1000
                    #delta_time = math.ceil(delta_time*100)/100
                    #delta_distance = math.ceil(delta_distance*100)/100
                    if delta_time>0 and delta_distance>0 and delta_time < 1:
                        print "%s|%s|%s|%s\t%s\t%s" % (prior_route, prior_stop, prior_tripid, prior_dir, str(delta_time), str(delta_distance))

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
        prior_tripid = tripid
        prior_stop = stop
        prior_time = time_stamp
        prior_distance = distance


if __name__ == "__main__":
    main()
