#!/usr/bin/env python

###############################################################################
## mapper1-new.py
## converting shapeid+segmentid and find the distance
## contact: drp354@nyu.edu
###############################################################################

import sys
import csv
from datetime import datetime


def parseInput():
    for line in sys.stdin:
        line = line.strip('\n')
        values = line.split('\t')
        if values[0] != 'latitude':
            yield values


def initTripLookUp():
    filename = "trip2shape_historical.csv"
    d = {}

    with open(filename, 'rb') as f:
        csvReader = csv.reader(f)

        for row in csvReader:
            tripid = str(row[0])
            shapeid = str(row[1])

            if tripid not in d: 
                d[tripid] = shapeid
            else:
                pass
    return d


def initSegmentLookUp():
    filename = "mta_shapes_meters_2014-ACCUMULATED.csv"
    d = {}

    with open(filename, 'rb') as f:
        csvReader = csv.reader(f)
        headers = next(csvReader)

        for row in csvReader:
            shape_id = str(row[0])
            segment_id = str(row[1])
            meters_accumulated = str(row[2])
        
            if (shape_id not in d) or (segment_id not in d[shape_id]):
                if shape_id not in d: 
                    d[shape_id] = {}
                d[shape_id][segment_id] = meters_accumulated

    return d


def main():
    
    lookup_trip = initTripLookUp()
    lookup_segment = initSegmentLookUp()

    for row in parseInput():
        time_stamp = row[2]
        busid = row[3]  

        try:      
            distance_along_route = float(row[4])
        except:
            print "ERROR CONVERTING DISTANCE : "+row[4]

        direction = row[5]
        status = row[6]
        route = row[7]
        tripid = row[8]
        stop = row[10]

        if status == 'IN_PROGRESS':
            if tripid in lookup_trip:
                shape_id = lookup_trip[tripid]

                if shape_id in lookup_segment:
                    cur_distance = 0
                    i = 1

                    _isInRoute = True
                    shapeLen = len(lookup_segment[shape_id])
                    while (distance_along_route > cur_distance) and _isInRoute:
                         #print shape_id, shapeLen, str(i), distance_along_route, cur_distance
                         if (i <= shapeLen):
                             cur_distance = float(lookup_segment[shape_id][str(i)])
                             shape_seg = shape_id + '-' + str(i)
                             i += 1
                         else:
                             _isInRoute = False
                    if _isInRoute:
                        print '%s|%s|%s|%s|%s\t%s' % (busid,direction,route,time_stamp,distance_along_route, shape_seg)

                else:
                    pass


if __name__ == "__main__":
    main()
