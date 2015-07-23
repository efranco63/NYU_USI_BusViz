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


def loadRedis(shape_id):
	pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=11)
	r = redis.Redis(connection_pool=pool)
	output = r.hget('speed_distance',shape_id)
	output =  ast.literal_eval(str(output))
	return output

def loadTopMean():
	pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=11)
	r = redis.Redis(connection_pool=pool)
	top5hi = r.hget('top5hi','top5hiLine')
	top5lo = r.hget('top5lo','top5loLine')
	median = r.hget('median','median_of_all')
	return top5hi,top5lo,median