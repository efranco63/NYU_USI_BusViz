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

$HJS -D mapreduce.job.reduces=1 \
-files mapper1.py,reduce1.py \
-mapper mapper1.py  \
-reducer reduce1.py  \
-input BusSpeed/input  \
-output BusSpeed/output1
