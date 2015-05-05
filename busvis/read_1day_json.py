#!/usr/local/bin/python2.7

############################################################################### s
## read_1day_json.py 
## read json output of the timestamp
## contact: drp354@nyu.edu
###############################################################################

import json

# parameters
json_filename = 'data/0804.json'

def loadJson():
    with open(json_filename) as f:
        outJson =  json.load(f)
    return outJson

def readStopId(stop_id):
    json_object = loadJson()
    return json_object[stop_id]	
    #return json.dump(json_object[stop_id])
