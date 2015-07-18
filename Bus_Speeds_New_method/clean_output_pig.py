#!/usr/bin/env python

###############################################################################
## clean_output_pig.py
## fix aggregation
## contact: drp354@nyu.edu
###############################################################################

import sys
from datetime import datetime
import math
import csv

def removeDuplicate():
    filename = "speed-mph-shapeid-new-ALLBOROUGH-HUY-FILE.csv"
    d = {}

    with open(filename, 'rb') as f:
        csvReader = csv.reader(f, delimiter='\t')
        headers = next(csvReader)

        for row in csvReader:
            try:
                shape_id = str(row[0])
                speed = str(row[1])
                nstop = str(row[2])
                print row[2]
            except:
                print "ERROR: " + str(row)
                 
    return d

if __name__ == "__main__":
    removeDuplicate()

