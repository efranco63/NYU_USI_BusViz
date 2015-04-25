# adding alias to the hadoop jaar
HFS='/usr/local/hadoop/bin/hadoop fs '
HJS='/usr/local/hadoop/bin/hadoop jar /usr/local/hadoop/share/hadoop/tools/lib/hadoop-streaming-2.2.0.jar'

month='08'

# map reduce 1
# run the MR
for i in {1..9}; do $HJS -D mapred.reduce.tasks=10 -files mapper.py,reducer.py -mapper mapper.py -reducer reducer.py -input /user/ef1265/BusData/MTA-Bus-Time_.2014-${month}-0${i}.txt -output /user/ef1265/USI/days/${month}0$i; done
# merge the output files
for i in {1..9}; do $HFS -getmerge /user/ef1265/USI/days/${month}0$i /home/cusp/ef1265/USI/days/${month}0$i; done
#copy over to HDFS
for i in {1..9}; do $HFS -copyFromLocal /home/cusp/ef1265/USI/days/${month}0$i /user/ef1265/USI/data/${month}0$i; done

# map reduce 2
for i in {1..9}; do $HJS -D mapred.reduce.tasks=10 -files mapper2.py,reducer2.py -mapper mapper2.py -reducer reducer2.py -input /user/ef1265/USI/data/${month}0$i -output /user/ef1265/USI/days/waittimes${month}0$i; done
# merge the output files
for i in {1..9}; do $HFS -getmerge /user/ef1265/USI/days/waittimes${month}0$i /home/cusp/ef1265/USI/days/waittimes${month}0$i; done