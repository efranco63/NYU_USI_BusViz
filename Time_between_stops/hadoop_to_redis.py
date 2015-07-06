import numpy as np
import redis
import time

# ************************ CALCULATED BUS ARRIVAL TIMES ***************************************

print '--------> PROCESSING CALCULATED BUS ARRIVAL TIMES: '

# open Hadoop output file
text_file = open('waittimes2_8day', "r")
lines = text_file.readlines()
text_file.close()

print '--------> Total lines of output: '+str(len(lines))+'\n'

# initialize redis database
r = redis.StrictRedis(host='localhost', port=6379, db=44)

# dictionary mapping some names in calculated waitimes to match names in scheduled wait times
mapping = {'M34A+': 'SBS34', 'M60+': 'SBS60', 'M15+': 'SBS15', 'M34+': 'SBS34', 'S79+': 'SBS79', 'BX12+': 'SBS12', 'BX41+': 'SBS41'}

start_time = time.time()
# loop through hadoop output line by line and insert key-value into redis DB
print '--------> Writing Hadoop output to Redis: \n'
ctr = 0
for line in lines:
	if (ctr%10000 == 0) and (ctr != 0):
		print 'On line '+str(ctr)+'\n'
	if ctr != 0:
	    dte,stop,route,times,bins = line.strip().split('|')
	    # match naming format of scheduled bus times
	    stop = stop[4:]
	    if route[:4] == 'MTA ':
	    	route = route[9:]
	    elif route[:5] == 'MTABC':
	    	route = route[6:]
	    if route in mapping:
	    	route = mapping[route]
	    times = times+'|'+bins
	    key = dte+'-'+stop
	    # insert into redis database where date+stop are key, route the field, and times the values
	    r.hset(key,route,times)
	ctr += 1

# ************************ SCHEDULED BUS ARRIVAL TIMES ***************************************

print '--------> PROCESSING SCHEDULED BUS ARRIVAL TIMES: '

# open Hadoop output file
text_file = open('schedule_times_aug', "r")
lines = text_file.readlines()
text_file.close()

print '--------> Total lines of output: '+str(len(lines))+'\n'

# initialize redis database
r = redis.StrictRedis(host='localhost', port=6379, db=45)

# loop through hadoop output line by line and insert key-value into redis DB
print '--------> Writing Hadoop output to Redis: \n'
ctr = 0
for line in lines:
	if (ctr%10000 == 0) and (ctr != 0):
		print 'On line '+str(ctr)+'\n'
	if ctr != 0:
	    stop,route,times,bins = line.strip().split('|')
	    times = times+'|'+bins
	    # insert into redis database where date+stop are key, route the field, and times the values
	    r.hset(stop,route,times)
	ctr += 1


print("--------> Total process time: --- %s seconds ---" % (time.time() - start_time))