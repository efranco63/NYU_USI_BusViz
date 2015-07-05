###############################################################################
##
## launch_mapreduce.sh
## run map reduce 1 & 2 and copy to buscloud
## contact: drp354@nyu.edu
##
###############################################################################


# adding alias to the hadoop jaar
HFS='/usr/local/hadoop/bin/hadoop fs '
HJS='/usr/local/hadoop/bin/hadoop jar /usr/local/hadoop/share/hadoop/tools/lib/hadoop-streaming-2.2.0.jar'

$HJS -D mapreduce.job.reduces=0 \
-files mapper2-withMTAdistance.py, trip_shape_lookup.txt \
-mapper mapper2-withMTAdistance.py  \
-input BusSpeed/out-temp  \
-output BusSpeed/output-MR2-shapeid

