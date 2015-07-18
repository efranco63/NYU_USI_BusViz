################ WARNING: code with no comments :(
################

import itertools
import json
import math
import pyproj as pp
import shapely.geometry as geom
import shapely.ops as ops
import sys

###############################################
###############################################
####### CHANGE THIS AGGREGATION FUNCTION ######
### Take in a list of JSON's props and put  ###
### out an aggregated props                 ###
###############################################
###############################################

def aggregate(records):
    speed = 0.0
    shape_id=[]
    for r in records:
        speed += r['speed']
        if str(r['shape_id']) not in shape_id:
            shape_id.append(str(r['shape_id']))
    if len(records)>0:
        speed /= len(records)
    print shape_id
    return {'speed': speed,'shape_id':shape_id[0]}

proj = pp.Proj(init='esri:26918')
def realDistance(coords):
    return geom.LineString(map(lambda x: proj(*x), coords)).length

def isAligned(p1, p0, p2):
    # return geom.LineString((p1, p2)).distance(geom.Point(p0))
    # Using the equation from:
    # https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
    x0,y0 = p0
    x1,y1 = p1
    x2,y2 = p2
    x21 = x2-x1
    y21 = y2-y1
    distance = abs(y21*x0-x21*y0+x2*y1-y2*x1)
    if x21!=0 or y21!=0:
        distance /= math.sqrt(x21*x21+y21*y21)
    return distance<0.1

def createEdge(pts):
    return tuple(pts)

def shiftLine(line, distance):
    p = (proj(*line[0]), proj(*line[1]))
    d = (p[0][0]-p[1][0], p[0][1]-p[1][1])
    n = (-d[1], d[0])
    l = math.sqrt(n[0]*n[0]+n[1]*n[1])
    n = (n[0]/l, n[1]/l)
    return (proj(p[0][0] + n[0]*distance, p[0][1] + n[1]*distance, inverse=True),
            proj(p[1][0] + n[0]*distance, p[1][1] + n[1]*distance, inverse=True))

if __name__=='__main__':

    if len(sys.argv)!=3:
        print 'Usage: python %s INPUT_JSON OUTPUT_JSON' % sys.argv[0]
        sys.exit(0)

    with open(sys.argv[1], 'rb') as f:
        gjson = json.load(f)
    lines = [(geom.shape(feature['geometry']), feature['properties']) for feature in gjson['features']]

    edges = {}

    for (line,props) in lines:
        pts = line.coords

        for i in xrange(len(pts)-1):
            e = createEdge(pts[i:i+2])

            if e[0]!=e[1] and (e not in edges):
                edges[e] = (e, (1.0, props))

    for (line,props) in lines:
        pts = line.coords
        for i in xrange(len(pts)-2):
            e = createEdge(pts[i:i+2])
            pp = proj(*pts[i])
            mm = proj(*pts[i+1])
            for q in xrange(i+2, len(pts)):
                qq = proj(*pts[q])
                if not isAligned(pp, mm, qq): break
                e = createEdge((pts[i], pts[q]))
                cur = edges.get(e, None)
                if cur:
                    seg = tuple(k for k, g in itertools.groupby(pts[i:q+1]))
                    if len(seg)==2: seg = createEdge(seg)
                    if len(seg)>1 and seg!=e and set(cur[0])!=set(seg):
                        if cur[0]!=e:
                            ds = realDistance(cur[0])
                            for j in xrange(len(cur[0])-1):
                                edges[createEdge(cur[0][j:j+2])] = (e, (realDistance(cur[0][j:j+2])/ds, props))
                            ds = realDistance(seg)
                            for j in xrange(len(seg)-1):
                                edges[createEdge(seg[j:j+2])] = (e, (realDistance(seg[j:j+2])/ds, props))
                            edges[e] = (e, (1.0, props))
                        else:
                            edges[e] = (seg, (1.0, props))

    print len(edges)

    items = []
    for (line,props) in lines:
        pts = line.coords
        for i in xrange(len(pts)-1):
            s = createEdge(pts[i:i+2])
            if s[0]==s[1]: continue
            (segs, v) = edges[s]
            for j in xrange(len(segs)-1):
                k = createEdge(segs[j:j+2])
                items.append((k, v))

    agg = {}
    keyfunc = lambda x: x[0]
    for k, g in itertools.groupby(sorted(items, key=keyfunc), keyfunc):
        segs = list(g)
        cnt = len(segs)
        if cnt>0:
            s = shiftLine(k, 2)
            props = [r[1][1] for r in segs]
            agg[s] = aggregate(props)

    features = []
    fid = 0
    for fid, (s, c) in enumerate(agg.iteritems()):
        geometry = {
            'type'        : 'LineString',
            'coordinates' : list(map(list, s)),
        }
        properties = c
        feature = {
            'type'        : 'Feature',
            'id'          : str(fid),
            'geometry'    : geometry,
            'properties'  : properties
        }
        features.append(feature)
    output = {
        'type': 'FeatureCollection',
        'features': features,
    }
    fout = open(sys.argv[2], 'wb') if sys.argv[2]!='-' else sys.stdout 
    fout.write(str(output).replace("'", '"') + '\n')
