#!/usr/local/bin/python2.7

############################################################################### s
## prepare_stop_id_json_for_histogram.py 
## take json output from file or redis and transform
## 
## contact: rp2427@nyu.edu
###############################################################################

import json

def transformJsonForJs(old_json):
	json_for_js = {}

	for k in old_json:

		perbusline_json = transformJsonForJsPerBusline(k, old_json[k])
		#print "--- in the loop: perbusline_json"
		#print perbusline_json

		#json_for_js[k].append(perbusline_json)
		json_for_js[k] = perbusline_json

	return json_for_js


def transformJsonForJsPerBusline(busline, old_json):
	new_json = {}
	
	data = old_json.split('|')
	# data = [old_json.split('|') for k in old_json][0]
	times = data[0].split(',')
	bins = data[1].split(',')

	# define 3 timeslots
	for b in bins:
		if(b not in new_json):
			new_json[b] = []

	for i in range(len(bins)):
		# dirty hack to get rid of super high numbers that destroy our histograms
		#print " ---- i: -----", i
		#print " ---- times[i]: -----", times[i]
		if(times[i] != ''):
			if(getSec(times[i]) < 10000):
				new_json[bins[i]].append(getSec(times[i]))

	return new_json



def getSec(s):
	l = s.split(':')
	seconds = int(l[0]) * 3600 + int(l[1]) * 60 + int(l[2])
	return seconds




