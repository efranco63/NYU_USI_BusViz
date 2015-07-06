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

    prior_route = None
    prior_stop = None
    prior_time = None
    times = []
    bins = []

    for row in data:

        if prior_route != None:

            try:
                stop = row[0]
                route = row[1]
                time_stamp = datetime.strptime(row[2],'%H:%M:%S')
                hr = time_stamp.hour
                tbins = [[7,8,9,10,11,12,13,14,15,16,17,18],[19,20,21,22,23],[0,1,2,3,4,5,6]]
                if hr in tbins[0]:
                    bin = 0
                elif hr in tbins[1]:
                    bin = 1
                else:
                    bin = 2

                if (route == prior_route) and (stop == prior_stop):
                    time_delta = time_stamp - prior_time
                    times.append(time_delta)
                    bins.append(bin)
                    prior_route = route
                    prior_stop = stop
                    prior_time = time_stamp

                else:
                    print "%s|%s|%s|%s" %(prior_stop,prior_route,','.join(str(e) for e in times),','.join(str(e) for e in bins))
                    bins = []
                    times = []
                    prior_route = route
                    prior_stop = stop
                    prior_time = time_stamp

            except ValueError:
                pass

        else:
            prior_stop = row[0]
            prior_route = row[1]
            prior_time = datetime.strptime(row[2],'%H:%M:%S')


if __name__ == "__main__":
    main()