#!/usr/bin/env python
"""A more advanced Reducer, using Python iterators and generators."""

from itertools import groupby
from operator import itemgetter
import sys

def read_mapper_output(file, separator='\t'):
    for line in file:
        yield line.rstrip().split(separator)

def main(separator='\t'):
    bus_count = {}
    bus_count_w = {}
    # input comes from STDIN (standard input)
    data = read_mapper_output(sys.stdin, separator=separator)
    for line in data:
        wk = line[0]
        bus_id = line[2]
        date = line[1]
        
        # make sure the bus_id being looked at is a valid number 
        try:    
            bus_id = int(bus_id)
        except ValueError:
            continue

        # insert into the bus count dictionary for day
        if date in bus_count:
            if bus_id in bus_count[date]:
                bus_count[date][bus_id] += 1
            else:
                bus_count[date][bus_id] = 1
        else:
            bus_count[date] = {}
            bus_count[date][bus_id] = 1

        #insert into the bus count dictionary for week
        if wk in bus_count_w:
            if bus_id in bus_count_w[wk]:
                bus_count_w[wk][bus_id] += 1
            else:
                bus_count_w[wk][bus_id] = 1
        else:
            bus_count_w[wk] = {}
            bus_count_w[wk][bus_id] = 1


    for key in sorted(bus_count):
        print 'For date: ' + key + ' there are ' + str(len(bus_count[key])) + ' unique buses'

    for key in sorted(bus_count_w):
        print 'For week: ' + key + ' there are ' + str(len(bus_count_w[key])) + ' unique buses'       

if __name__ == "__main__":
    main()