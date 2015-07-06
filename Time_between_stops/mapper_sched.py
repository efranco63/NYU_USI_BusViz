#!/usr/bin/python

import sys

def read_input(file):
    for line in file:
        #split the line into words
        yield line.strip().split(',')

def main():
    
    ctr = 1
    # input comes from STDIN (stream data that goes to the program)
    data = read_input(sys.stdin)

    for row in data:

        # skip header
        if not ctr == 1:
            # pull stop id, route id, direction, time stamp of ping, and bus id
            trip_id = row[0].split('_')
            dow = trip_id[1][3:10]
            if dow == 'Weekday':
                route = trip_id[-2]
                stop = row[-4]
                time_stamp = row[1]
                # generate key-value pair to emit
                key = stop+'|'+route+'|'+time_stamp
                val = 1

                print "%s\t%s" %(key,val)

        ctr += 1

if __name__ == "__main__":
    main()