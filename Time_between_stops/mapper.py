#!/usr/bin/python

import sys
import math
from datetime import datetime
import os

def read_input(file):
    for line in file:
        # if the line is from the weather data set
        if line[0:7] == 'WEATHER':
            row = line.strip().split(",")
            # remove the word 'WEATHER'
            row[0] = row[0][7:]
            yield row

def main():
    # input comes from STDIN (stream data that goes to the program)
    idx = create_rtree()

    data = read_input(sys.stdin)

    for row in data:


        # if the input is from the taxi data
        if len(row) == 21:

            #get lng,lats
            pickup_lng = float(row[10])
            pickup_lat = float(row[11])
            drop_lng = float(row[12])
            drop_lat = float(row[13])
            # convert to datetime
            date = datetime.strptime(row[3], '%Y-%m-%d %H:%M:%S')
            # get year, month, day and hour and concatenate
            year = datetime.strftime(date, '%Y')
            month = datetime.strftime(date, '%m')
            day = datetime.strftime(date, '%d')
            hour = datetime.strftime(date, '%H')
            key = year+month+day+hour+'-T'

            pickup_zip = 0
            drop_zip = 0

            # get lists of zipcodes this particular sample falls into
            pickup_hits = list(idx.intersection((pickup_lng, pickup_lat)))
            drop_hits = list(idx.intersection((drop_lng, drop_lat)))

            #determine actual zip if more than 1 hit
            if len(pickup_hits) > 1:
                for i in pickup_hits:
                    bbPath = mplPath.Path(nyc[str(i)]['geometry']['shape'])
                    if bbPath.contains_point((pickup_lng, pickup_lat)):
                        pickup_zip = i
            else:
                pickup_zip = pickup_hits[0]

            if len(drop_hits) > 1:
                for i in drop_hits:
                    bbPath = mplPath.Path(nyc[str(i)]['geometry']['shape'])
                    if bbPath.contains_point((drop_lng, drop_lat)):
                        drop_zip = i
            else:
                drop_zip = drop_hits[0] #SOMETIMES THIS IS AN EMPTY LIST, IF IT IS THE CASE, IGNORE

            row.append(pickup_zip)
            row.append(drop_zip)

            print "%s,%s" %(key,','.join(str(e) for e in row))

        # if the input comes from weather data
        else:
            key = row[0]
            val = row[1:]
            print "%s,%s" %(key,','.join(str(e) for e in val))


if __name__ == "__main__":
    main()