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

    prior_date = None
    prior_stop = None
    prior_route = None
    prior_dir = None
    prior_stime = None
    prior_etime = None
    maxtimes = []
    bins = []
    zero = '00:00:00'

    for row in data:

        # pull stop id, route id, direction, time stamp of ping, and bus id
        dte = row[0]
        stop = row[1]
        route = row[2]
        direction = row[3]
        stime = datetime.strptime(row[4],'%H:%M:%S')
        etime = datetime.strptime(row[5],'%H:%M:%S')
        
        # determine bin
        e_hr = etime.hour
        tbins = [[7,8,9,10,11,12,13,14,15,16,17,18],[19,20,21,22,23],[0,1,2,3,4,5,6]]
        if e_hr in tbins[0]:
            bin = 0
        elif e_hr in tbins[1]:
            bin = 1
        else:
            bin = 2

        if (dte == prior_date) and (stop == prior_stop) and (route == prior_route):
            if (direction == prior_dir):
                maxtime_delta = etime - prior_stime
                # if this value is negative, means there is a possible bus overlap, output 0 waittime
                if str(maxtime_delta)[0] == '-':
                    maxtimes.append(zero)
                else:
                    maxtimes.append(maxtime_delta)
                bins.append(bin)
            prior_date = dte
            prior_stop = stop
            prior_route = route
            prior_dir = direction
            prior_stime = stime
            prior_etime = etime

        else:
            # print the accumulated times for the prior stop, route and direction
            print "%s|%s|%s|%s|%s" %(prior_date, prior_stop,prior_route,','.join(str(e) for e in maxtimes),','.join(str(e) for e in bins))
            bins = []
            maxtimes = []
            prior_date = dte
            prior_stop = stop
            prior_route = route
            prior_dir = direction
            prior_stime = stime
            prior_etime = etime

if __name__ == "__main__":
    main()