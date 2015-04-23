#!/usr/bin/python

import sys
from datetime import datetime

def read_input(file):
    for line in file:
        #split the line into words
        yield line.strip().split('|')

def main():
    
    # input comes from STDIN (stream data that goes to the program)
    data = read_input(sys.stdin)

    prior_stop = None
    prior_route = None
    prior_dir = None
    prior_stime = None
    prior_etime = None
    mintimes = []
    maxtimes = []
    zero = '00:00:00'

    for row in data:

        # pull stop id, route id, direction, time stamp of ping, and bus id
        stop = row[0]
        route = row[1]
        direction = row[2]
        stime = datetime.strptime(row[3],'%H:%M:%S')
        etime = datetime.strptime(row[4],'%H:%M:%S')

        if (stop == prior_stop) and (route == prior_route):
            if (direction == prior_dir):
                mintime_delta = stime - prior_etime
                if str(mintime_delta)[0] == '-':
                    # if this value is negative, means there is a possible bus overlap, output 0 waittime
                    mintimes.append(zero)
                else:
                    mintimes.append(mintime_delta)
                maxtime_delta = etime - prior_stime
                # if this value is negative, means there is a possible bus overlap, output 0 waittime
                if str(maxtime_delta)[0] == '-':
                    maxtimes.append(zero)
                else:
                    maxtimes.append(maxtime_delta)
            prior_stop = stop
            prior_route = route
            prior_dir = direction
            prior_stime = stime
            prior_etime = etime

        else:
            # print the accumulated times for the prior stop, route and direction
            print "%s|%s|%s|%s" %(prior_stop,prior_route,','.join(str(e) for e in mintimes),','.join(str(e) for e in maxtimes))
            mintimes = []
            maxtimes = []
            prior_stop = stop
            prior_route = route
            prior_dir = direction
            prior_stime = stime
            prior_etime = etime

if __name__ == "__main__":
    main()