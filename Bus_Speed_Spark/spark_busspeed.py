#!/usr/bin/env python
import sys
import csv
import datetime
from datetime import datetime as dt
from collections import OrderedDict



# initialize trip-shape lookup dictionary


def initTripLookUp():
    filename = 'trip2shape_historical.csv'
    d = OrderedDict({})
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



# initialize shape-id-seq to distance dictionary
# dict[shape_id][seg]--->accumulated distance and next stopid


def initSegmentLookUp():
    #filename = "segment_meters_FULL-ACCUMULATED.csv"
    filename = "mta_shapes_meters_historical_remapped.csv"
    d = OrderedDict({})
    with open(filename, 'rb') as f:
        csvReader = csv.reader(f)
        headers = next(csvReader)
        for row in csvReader:
            shape_id = str(row[0])
            segment_id = str(row[1])
            meters_accumulated = str(row[2])
            stop = str(row[3])
            distance_stopid = meters_accumulated + "^" + stop
            if (shape_id not in d) or (segment_id not in d[shape_id]):
                if shape_id not in d:
                    d[shape_id] = []
                d[shape_id].append((segment_id, distance_stopid))
    return d



# MAP PHASE: load data and generate key,value pair
# ((key1,key2,key3),[value1,value2,value3])


def createpair(x):
    row = x.split('\t')
    if row[6] == 'IN_PROGRESS':
        time_stamp = str(row[2])
        busid = str(row[3])
        distance_along_route = float(row[4])
        direction = str(row[5])
        route = str(row[7])
        tripid = str(row[8])
        if tripid in lookup_trip:
            shapeid = lookup_trip[tripid]
            if shapeid in lookup_segment:
                for seg in range(len(lookup_segment[shapeid]) - 1):
                    try:
                        if float(lookup_segment[shapeid][seg][1].split('^')[0]) <= distance_along_route\
                                and float(lookup_segment[shapeid][seg + 1][1].split('^')[0]) > distance_along_route:
                            shape_seq = lookup_segment[shapeid][seg][0]
                            stopid = lookup_segment[shapeid][
                                seg][1].split('^')[1]
                            return ((shapeid, shape_seq, stopid), [time_stamp, distance_along_route, busid])
                        else:
                            pass
                    except:
                        pass

# dictionaries initialization
lookup_trip = initTripLookUp()
lookup_segment = initSegmentLookUp()

# trivial func


def delta_to_second(x):
    return float(x.days * 24.0 * 3600) + float(x.seconds)


def delta_to_hour(x):
    return float(x.days * 24.0) + float(x.seconds / 60.0 / 60.0)

# REDUCE PHASE: load (key,[values]) pair and generage speed per key
# (key,speed)


def average_speed(x):
    previous_busid = None
    previous_distance = None
    previous_time = None
    start_time = None
    start_distance = None
    start_busid = None
    key, values = x[0],list(x[1])
    speeds = []
    values.sort(key=lambda x: (dt.strptime(x[0], '%Y-%m-%d %H:%M:%S'), x[2]))
    for i in values:
        bus = i[2]
        distance = i[1]
        time = dt.strptime(i[0], '%Y-%m-%d %H:%M:%S')
        if bus == previous_busid and delta_to_second(time - previous_time) < 60:
            previous_time = time
            previous_distance = distance
        else:
            if previous_busid and previous_time and previous_time != start_time:
                speed = (previous_distance - start_distance) / \
                    float(delta_to_hour(previous_time - start_time)) / 1000.0
                speeds.append(speed)
            previous_time = time
            previous_distance = distance
            previous_busid = bus
            start_time = time
            start_distance = previous_distance
            start_busid = bus
    if previous_busid and previous_time != start_time:
        speed = (previous_distance - start_distance) / \
            float(delta_to_hour(previous_time - start_time)) / 1000.0
        speeds.append(speed)
    if len(speeds) > 0:
        return (key, sum(speeds) / float(len(speeds)))
    else:
        return (key, None)

def writeRecords(records):
    output = StringIO.StringIO()
    writer = csv.DictWriter(output, fieldnames=["key", "speed"])
    for record in records:
        key=','.join(record[0])
        value=record[1]
        if value:
            writer.writerow(key+','+str(value))
        return [output.getvalue()]



# spark RDD operation
buspins = sc.textFile(
    '/user/share/MTA_BusTime_Historical/MTA-Bus-Time_.2014-10-29.txt')
bus_speed = buspins.map(
    createpair).filter(lambda x: x != None).groupByKey().map(average_speed)
# test
bus_speed.saveAsTextFile('jiamin_spark_1029_speed')
