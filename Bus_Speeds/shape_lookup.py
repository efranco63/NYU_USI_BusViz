from geopandas import GeoDataFrame as df
import math
from math import sin, cos, sqrt, atan2, radians
from shapely.geometry import LineString, Point
import json
# get_ipython().magic(u'matplotlib inline')
R = 6373.0


# from shape generate start_end points in sequence

allstation = df.from_csv('shapes.txt', index_col=None)
allstation['shape_group'] = allstation[
    'shape_pt_sequence'].apply(lambda x: math.floor(x / 10000))
start_point = allstation.groupby(
    by=['shape_id', 'shape_group']).first().reset_index()
end_point = allstation.groupby(
    by=['shape_id', 'shape_group']).last().reset_index()

# end_point['geometry']=end_point[['shape_pt_lat','shape_pt_lon']].apply(lambda x: Point(x[0],x[1]),axis=1)


# read speed, find nearest start_end point for each station

def distance(xlat, xlon, ylat, ylon):
    dlon = ylon - xlon
    dlat = ylat - xlat
    a = sin(dlat / 2) ** 2 + cos(xlat) * cos(ylat) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    return distance

speed = df.from_csv('speed.txt', sep='|', index_col=None, header=None)
speed.columns = [
    'route_id', 'station_id', 'direction', 'shape_id', 'speed/mph']
station = df.from_csv('stops.txt')[['stop_lat', 'stop_lon']]
# station['geometry']=station[['stop_lat','stop_lon']].apply(lambda x: Point(x[0],x[1]),axis=1)

tmp = speed.merge(station, how='left', right_index=True, left_on='station_id')
tmp = tmp.dropna()
tmp['shape_group'] = 0

for i in tmp.index:
    speed_row = tmp.ix[i]
    xlat = speed_row['stop_lat']
    xlon = speed_row['stop_lon']
    shape_id = speed_row['shape_id']
    list_of_points = end_point[end_point['shape_id'] == shape_id]
    mindist = 1000000.0
    for y in list_of_points.index:
        ylat = float(list_of_points.ix[[y], ['shape_pt_lat']].values[0])
        ylon = float(list_of_points.ix[[y], ['shape_pt_lon']].values[0])
        dist = distance(xlat, xlon, ylat, ylon)
        if dist < mindist:
            mindist = dist
            tmp_row = list_of_points.ix[y]
    tmp.ix[[i], ['shape_group']] = tmp_row.shape_group


# generate geojson with speed for each line

finaltable = allstation.merge(tmp, how='left', on=['shape_id', 'shape_group']).dropna()[
    ['route_id', 'shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence', 'shape_group', 'speed/mph']]

shapeline = {}
for i in set(finaltable.shape_id):
    for j in set(finaltable[finaltable['shape_id'] == i]['shape_group']):
        tmpdict = {}
        line = LineString(zip(finaltable['shape_pt_lon'][(finaltable['shape_group'] == j) & (finaltable['shape_id'] == i)],
                              finaltable['shape_pt_lat'][(finaltable['shape_group'] == j) & (finaltable['shape_id'] == i)]))
        tmpdict['geometry'] = line
        tmpdict['speed'] = max(finaltable[
                               'speed/mph'][(finaltable['shape_group'] == j) & (finaltable['shape_id'] == i)])
        route = finaltable['route_id'][(finaltable['shape_group'] == 11) & (
            finaltable['shape_id'] == 'B10157')].tolist()[0]
        shapeline[route + '-' + str(i) + '-' + str(int(j))] = tmpdict

with open('test_shape.json', 'w') as outfile:
    json.dumps(df(shapeline).transpose().to_json(), outfile)


# save to json

test = df(shapeline).transpose()
test['id'] = test.index
a = test.to_json()

with open('speed_shape.json', 'w') as outfile:
    outfile.write(a)
