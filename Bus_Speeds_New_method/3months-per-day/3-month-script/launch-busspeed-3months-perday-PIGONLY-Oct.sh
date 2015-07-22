###############################################################################
##
## create pig script and run script for 30 days
## contact: drp354@nyu.edu
##
###############################################################################


# adding alias to the hadoop jaar
HFS='/usr/local/hadoop/bin/hadoop fs '
HJS='/usr/local/hadoop/bin/hadoop jar /usr/local/hadoop/share/hadoop/tools/lib/hadoop-streaming-2.2.0.jar'


STARTDATE=2014-10-01
NUMDAYS=31

for (( i=0; i<$NUMDAYS; i++ ))
    do
       CUR_DATE=$(date +%Y-%m-%d -d "$STARTDATE + $i day")
       PIG_FILE=pig-scripts-3months/sort_ave_busspeed-$CUR_DATE.pig
       pig -x mapreduce -f $PIG_FILE
    done
