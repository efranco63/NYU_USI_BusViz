#!/usr/local/bin/python2.7

import read_1day_json 

stop_id = "MTA_803008"
stop_id_json = read_1day_json.readStopId(stop_id)
print stop_id_json


