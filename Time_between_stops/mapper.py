#!/usr/bin/python

import sys

def read_input(file):
    for line in file:
        #split the line into words
        yield line.strip().split('\t')

def main():
    
    ctr = 1
    # input comes from STDIN (stream data that goes to the program)
    data = read_input(sys.stdin)

    for row in data:

        # skip header
        if not ctr == 1:
            # pull stop id, route id, direction, time stamp of ping, and bus id
            stop = row[10]
            route = row[-4]
            direction = row[5]
            time_stamp = row[2]
            busid = row[3]
            # generate key-value pair to emit
            key = busid+'|'+direction+'|'+route+'|'+time_stamp+'|'+stop
            val = 1

            print "%s\t%s" %(key,val)

        ctr += 1

if __name__ == "__main__":
    main()