#!/usr/bin/python

import sys
from datetime import datetime

def read_input(file):
    for line in file:
        #split the line into words
        l = line.strip().split('\t')
        yield l[0].split('|')

def main():

    # input comes from STDIN (stream data that goes to the program)
    data = read_input(sys.stdin)

    prior_id = None
    prior_dir = None
    prior_route = None
    prior_stop = None
    prior_time = None

    for row in data:

        busid = row[0]
        direction = row[1]
        route = row[2]
        time_stamp = row[3]
        # time_stamp = datetime.strptime(row[3][-8],'%H:%M:%S')
        stop = row[4]

        if (busid == prior_id) and (direction == prior_dir) and (route == prior_route):
            # if this stop is different than the last, we know the bus has passed it
            # print the prrior stop along with the prior and current time so we know
            # the time frame in which the stop was passed
            if stop == prior_stop:
                continue
            else:
                print "%s|%s|%s" %(prior_stop,prior_time,time_stamp)
                prior_stop = stop

        else:
            prior_id = busid
            prior_dir = direction
            prior_route = route
            prior_stop = stop
            prior_time = time_stamp  


if __name__ == "__main__":
    main()