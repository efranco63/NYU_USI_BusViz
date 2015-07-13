#!/usr/bin/env python

###############################################################################
## mapper2.py
## converting to tripid to shapeid
## contact: drp354@nyu.edu
###############################################################################

import sys
import csv
from datetime import datetime


def parseInput():

    for line in sys.stdin:
        line = line.strip('\n')
        values = line.split('\t')
        yield values


def initTripLookUp():
    
    filename = "trip_shape_lookup.txt"
    d = {}

    with open(filename, 'rb') as f:
        csvReader = csv.reader(f)
        headers = next(csvReader)

        for row in csvReader:
            tripid = row[1].strip().split('-')
            tripid_min = str(tripid[1]) + '-' + str(tripid[2])
            routeid = str(row[0]).replace(" ", "")
            shapeid = str(row[2])
            
            #print routeid, tripid_min, shapeid     
             
            if (routeid not in d) or (tripid_min not in d[routeid]):
                if routeid not in d: 
                    d[routeid] = {}
                d[routeid][tripid_min] = shapeid
            else:
                pass
    return d


def main():
    
    lookup_trip = initTripLookUp()

    for row in parseInput():
        
        MRkey = row[0]      
        MRkey = MRkey.strip().split('|')
        route_id = MRkey[0]
        stop_id = MRkey[1]
        direction = MRkey[3]
        trip_id = MRkey[2].strip().split('-')
        trip_id_min = str(trip_id[1]) + '-' + str(trip_id[2])
        time = row[1]        
        distance = row[2]

        rid = route_id.split('_')[1] 
        if (rid in lookup_trip) and lookup_trip[rid]:
            if trip_id_min in lookup_trip[rid]:
                shape_id = lookup_trip[rid][trip_id_min]
                print '%s|%s|%s|%s\t%s\t%s' % (route_id,stop_id,direction,shape_id,time,distance)

if __name__ == "__main__":
    main()
