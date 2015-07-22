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


STARTDATE=2014-09-01
NUMDAYS=30

# mapreduce per day
for (( i=0; i<$NUMDAYS; i++ ))
    do
        CUR_DATE=$(date +%Y-%m-%d -d "$STARTDATE + $i day")
        $HJS -D mapreduce.job.reduces=10 \
        -D mapreduce.map.output.compress=true \
        -files mapper1-new.py,reduce1-new.py,trip2shape_historical.csv,mta_shapes_meters_historical_remapped.csv \
        -mapper mapper1-new.py  \
        -reducer reduce1-new.py  \
        -input /user/share/MTA_BusTime_Historical/MTA-Bus-Time_.$CUR_DATE.txt \
        -output BusSpeed-3month/output-mapreduce/$CUR_DATE
    done
