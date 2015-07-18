#!/usr/local/bin/python2.7

############################################################################### s
## get_speed_redis.py
## read speed data from redis for sidebar
##
## contact: drp354@nyu.edu
###############################################################################

import json
import redis
import ast 


def loadRedis(route_id):
	pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=10)
	r = redis.Redis(connection_pool=pool)
	output = r.hget('speed_distance',route_id)
	output =  ast.literal_eval(str(output))
	return output

# def loadJson():
#     with open(json_filename) as f:
#         outJson = json.load(f)
#     return outJson

# def readStopId(stop_id):
# 	# parameters
# 	json_filename = 'data/2014-08-04-MTA_100027.json'		# only one bus stop, but incl night/daytimes
#     json_object = loadJson()
#     return json_object[stop_id]
