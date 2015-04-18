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
    prior_time = None
    times = []

    for row in data:

        # pull stop id, route id, direction, time stamp of ping, and bus id
        stop = row[0]
        route = row[1]
        direction = row[2]
        time = datetime.strptime(row[3],'%H:%M:%S')

        if (stop == prior_stop) and (route == prior_route):
            if (direction == prior_dir):
                time_delta = time - prior_time
                times.append(time_delta)
            prior_stop = stop
            prior_route = route
            prior_dir = direction
            prior_time = time

        else:
            # print the accumulated times for the prior stop, route and direction
            print "%s,%s,%s" %(prior_stop,prior_route,','.join(str(e) for e in times))
            times = []
            prior_stop = stop
            prior_route = route
            prior_dir = direction
            prior_time = time

if __name__ == "__main__":
    main()