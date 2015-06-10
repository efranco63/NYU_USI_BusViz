# map reduce 1
/usr/local/hadoop/bin/hadoop jar /usr/local/hadoop/share/hadoop/tools/lib/hadoop-streaming-2.2.0.jar -D mapred.reduce.tasks=10 -files mapper.py,reducer.py -mapper mapper.py -reducer reducer.py -input /user/ef1265/USI/BusData* -output /user/ef1265/USI/waittimes1_8day

/usr/local/hadoop/bin/hadoop fs -getmerge /user/ef1265/USI/waittimes1_8day /home/cusp/ef1265/USI/data/waittimes1_8day

/usr/local/hadoop/bin/hadoop fs -copyFromLocal /home/cusp/ef1265/USI/data/waittimes1_8day /user/ef1265/USI/data/waittimes1_8day

# map reduce 2
/usr/local/hadoop/bin/hadoop jar /usr/local/hadoop/share/hadoop/tools/lib/hadoop-streaming-2.2.0.jar -D mapred.reduce.tasks=1 -files mapper2_2.py,reducer2_2.py -mapper mapper2_2.py -reducer reducer2_2.py -input /user/ef1265/USI/data/waittimes1_8day -output /user/ef1265/USI/waittimes2_8day

/usr/local/hadoop/bin/hadoop fs -getmerge /user/ef1265/USI/waittimes2_8day /home/cusp/ef1265/USI/data/waittimes2_8day