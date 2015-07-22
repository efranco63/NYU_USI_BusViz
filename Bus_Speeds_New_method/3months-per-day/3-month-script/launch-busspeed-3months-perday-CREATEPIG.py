###############################################################################
##
## create pig script and run script for 30 days
## contact: drp354@nyu.edu
##
###############################################################################


# adding alias to the hadoop jaar
STARTDATE=2014-08-01
NUMDAYS=92

# pig script per day
mkdir pig-scripts-3months

for (( i=0; i<$NUMDAYS; i++ ))
    do
        #file preparation
        CUR_DATE=$(date +%Y-%m-%d -d "$STARTDATE + $i day")
        PIG_FILE=pig-scripts-3months/sort_ave_busspeed-$CUR_DATE.pig
        
        #file preparation
        echo "in1 = LOAD 'BusSpeed-3month/output-mapreduce/$CUR_DATE' AS (id:chararray,time:float, distance:float );" >> $PIG_FILE
        echo "grpd  = GROUP in1 BY (id);" >> $PIG_FILE
        echo "ave  = FOREACH grpd GENERATE group, ((SUM(in1.distance) / SUM(in1.time) ) * 0.621371);" >> $PIG_FILE
        echo "ave1_ordered = ORDER ave BY group ASC;" >> $PIG_FILE
        echo "STORE ave1_ordered INTO 'BusSpeed-3month/output-pig/$CUR_DATE' USING PigStorage ('\t');" >> $PIG_FILE
    done

