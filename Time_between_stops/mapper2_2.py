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

    for row in data:

        # pull stop id, route id, direction, time stamp of ping, and bus id
        stop = row[0]
        direction = row[1]
        route = row[2]
        time_s = datetime.strptime(row[3][-8:],'%H:%M:%S')
        time_e = datetime.strptime(row[4][-8:],'%H:%M:%S')
        date_e = row[4][:10]
        # take the midpoint as time when the bus passed this stop
        # mid = (time_e - time_s)/2
        # time_stamp = time_e - mid

        print "%s|%s|%s|%s|%s|%s" %(date_e,stop,route,direction,time_s.strftime('%H:%M:%S'),time_e.strftime('%H:%M:%S'))

if __name__ == "__main__":
    main()