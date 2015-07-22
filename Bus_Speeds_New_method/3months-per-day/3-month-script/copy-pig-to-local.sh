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

STARTDATE=2014-08-01
NUMDAYS=92

mkdir output-speed

# mapreduce per day
for (( i=0; i<$NUMDAYS; i++ ))
    do
        CUR_DATE=$(date +%Y-%m-%d -d "$STARTDATE + $i day")
        $HFS -copyToLocal BusSpeed-3month/output-pig/$CUR_DATE/part* output-speed/speed-$CUR_DATE.csv
        echo "copied $CUR_DATE.csv sucessfully....."
    done


