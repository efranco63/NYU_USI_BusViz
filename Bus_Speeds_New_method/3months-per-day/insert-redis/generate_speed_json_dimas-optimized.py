#!/usr/local/bin/python2.7

############################################################################### s
## generate_speed_json_dimas-optimized.py
## write data each day to pickle and redis with optimization
## (using dictionaries instead of geopandas and heap memory for mean value)
##
## contact: drp354@nyu.edu
###############################################################################


import csv
import heapq
import cPickle as pickle
import redis
from datetime import timedelta, date


## ================= FUNCTION DECLARATIONS ===================

def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + timedelta(n)

def generateDatelist():
    dateList = []
    start_date = date(2014, 8, 1)
    end_date = date(2014, 10, 31)
    for single_date in daterange(start_date, end_date):
        dateList.append(single_date.strftime("%Y-%m-%d"))
    return dateList

def initTripLookUp():
    filename = "trips_historical_min.csv"
    d = {}
    sRID = set()
    sTHS = set()

    with open(filename, 'rb') as f:
        csvReader = csv.reader(f)
        headers = next(csvReader)

        for row in csvReader:
            routeid = str(row[0])
            trip_headsign = str(row[1])
            shapeid = str(row[3])

            if shapeid not in d:
                d[shapeid] = {}
                d[shapeid]['route_id'] = []
                d[shapeid]['route_name'] = []
                d[shapeid]['route_id'].append(routeid)
                d[shapeid]['route_name'].append(trip_headsign)
                sRID.add(routeid)
                sTHS.add(trip_headsign)
            else:
                if routeid not in sRID:
                    d[shapeid]['route_id'].append(routeid)
                if trip_headsign not in sTHS:
                    d[shapeid]['route_name'].append(trip_headsign)
    return d

def initDistanceLookUp():
    filename = "mta_shapes_meters_historical_remapped.csv"
    d = {}
    d_list = {}

    with open(filename, 'rb') as f:
        csvReader = csv.reader(f)
        headers = next(csvReader)

        for row in csvReader:
            shape_id  = str(row[0])
            seq_id  = str(row[1])
            full_id = shape_id+'-'+seq_id
            stopid = str(row[3])
            distance_per_id  = float(row[4])
            

            if full_id not in d:
                d[full_id] = (stopid,distance_per_id)

            if shape_id not in d_list:
                d_list[shape_id] = {}
                d_list[shape_id]['list_stop_id'] = []
                d_list[shape_id]['distance_per_id'] = []
            d_list[shape_id]['list_stop_id'].append(stopid)
            d_list[shape_id]['distance_per_id'].append(distance_per_id)                
                
    return d,d_list



def initSpeedLookUp(inputDate):
    setFullid = set()
    filename = "../output-speed/"+"speed-"+inputDate+".csv"
    d = {}

    with open(filename, 'rb') as f:
        csvReader = csv.reader(f,delimiter='\t')

        for row in csvReader:
            key  = str(row[0])
            full_id = key.split('|')[0]
            stop_id = key.split('|')[1]
            shape_id = full_id.split('-')[0]
            speed  = float(row[1])
            speed = round(speed,2)
            
            if full_id not in setFullid:
                setFullid.add(full_id)

            if full_id not in d:
                d[full_id] = (stop_id,speed)
    return d,setFullid

def nth_largest(iter):
    n = len(iter)/2
    return heapq.nlargest(n, iter)[-1]

def writePickle(pickle_dict, pickle_name):
    pickle.dump(pickle_dict, open( pickle_name+'.p', "wb" ))


# def writeRedis():
# ........in main function for the time being...........    



## ==================INIT LOOKUP TABLE================
#init table
dTrip = initTripLookUp()
dDistance, dDistanceList = initDistanceLookUp()


## ================= MAIN FUNCTION ===================
def main(inputDate):

    #variable declaration
    line_dict={}
    counter = 0
    inJFILE = set()
    notInJFILE = set()
    dSpeed,setFullid = initSpeedLookUp(inputDate)

    for full_id in setFullid:
        speed = dSpeed[full_id][1]
        distance = dDistance[full_id][1]
        stop = int(dDistance[full_id][0])
        shape_num = full_id.split('-')[0]
        seq = full_id.split('-')[1]
        
        if shape_num not in line_dict:
            line_dict[shape_num]={}
        line_dict[shape_num][seq]={}    
        line_dict[shape_num][seq]['speed']=speed
        line_dict[shape_num][seq]['distance']=distance
        line_dict[shape_num][seq]['stop_id']=stop
        
        if ('route_name' not in line_dict[shape_num]) or ('route_id' not in line_dict[shape_num]):
            try:
                route_name = dTrip[shape_num]['route_name']
                route_id = dTrip[shape_num]['route_id']
                line_dict[shape_num]['route_name']=route_name
                line_dict[shape_num]['route_id']=route_id
                inJFILE.add(shape_num)#DEBUG
            except:
                notInJFILE.add(shape_num)
        else:
            pass
        
        if 'list_stop_id' not in line_dict[shape_num]:
            line_dict[shape_num]['list_stop_id'] = dDistanceList[shape_num]['list_stop_id']
            line_dict[shape_num]['distance_per_id'] = dDistanceList[shape_num]['distance_per_id']        
        else:
            pass
        
    d_ave_each = {}

    counter = 0
    for shapeid, v1 in line_dict.items():
        for seq, v2 in v1.items():
            if seq != 'list_stop_id':
                try:
                    rid = v1['route_id'][0]
                    spd = v2['speed']
                    if rid not in d_ave_each:
                        d_ave_each[rid] = [] 
                    d_ave_each[rid].append(spd)     
                except:
                    pass
        counter += 1

    d_ave_each_perRoute = {}
    list_all_speed = []

    for shapeid, spd_list in d_ave_each.items():
        if shapeid not in d_ave_each_perRoute:
            try:
                d_ave_each_perRoute[shapeid] = nth_largest(d_ave_each[shapeid])
                list_all_speed += d_ave_each[shapeid]
            except:
                pass
        else:
            pass
        
    d_ave_each_perRoute_sorted = sorted(d_ave_each_perRoute.iteritems(), key=lambda x: (-x[1], x[0]), reverse=False)

    top5hi = d_ave_each_perRoute_sorted[:5]
    top5lo = d_ave_each_perRoute_sorted[-5:]
    median_of_all = nth_largest(list_all_speed)
    average_of_all = float(sum(list_all_speed))/len(list_all_speed)
    top5hiLine = []
    top5hiSpeed = []

    for k,v in top5hi:
        top5hiLine.append(k)
        top5hiSpeed.append(k)

    top5loLine = []
    top5loSpeed = []
    for k,v in top5lo:
        top5loLine.append(k)
        top5loSpeed.append(k)

    # dump pickle
    #writePickle(line_dict,'test1')

    # dump redis
    # equal to future writeRedis()
    pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=13)
    r = redis.Redis(connection_pool=pool)

    for shapeid in line_dict:
        r.hset(inputDate,'speed_distance'+'|'+shapeid, line_dict[shapeid])
    r.hset(inputDate,'top5hiLine', top5hiLine)
    r.hset(inputDate,'top5hiSpeed', top5hiSpeed)
    r.hset(inputDate,'top5loLine', top5loLine)
    r.hset(inputDate,'top5loSpeed', top5loSpeed)
    r.hset(inputDate,'median_of_all',median_of_all)
    r.hset(inputDate,'average_of_all',average_of_all)
    for route in d_ave_each:
        r.hset(inputDate,'speed_per_route_list'+'|'+route, d_ave_each[route]) 
    for route in d_ave_each_perRoute:
        r.hset(inputDate,'speed_per_route_median'+'|'+route,d_ave_each_perRoute[route])     


if __name__ == '__main__':
    inputDateList = generateDatelist()
    for inputDate in inputDateList:
        try:
            main(inputDate)
            print "finished inserting date: "+inputDate
        except:
            print "failed to perform on date: "+inputDate

