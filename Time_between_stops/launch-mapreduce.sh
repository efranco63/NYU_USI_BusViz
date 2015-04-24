

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

# map reduce 1
$HJS -D mapreduce.job.reduces=1 \
-files mapper.py,reducer.py \
-mapper mapper.py \
-reducer reducer.py  \
-input USI/input  \
-output USI/out-mr-1

# map reduce 2
$HJS \
-files mapper2.py,reducer2.py \
-mapper mapper2.py \
-reducer reducer2.py  \
-input USI/out-mr-1 \
-output USI/out-mr-2

#copy to cloud
$HFS -getmerge USI/out-mr-2 bus_list.csv
scp -rp bus_list.csv master@busvis.cloudapp.net:/var/www/html/busvis/data/
