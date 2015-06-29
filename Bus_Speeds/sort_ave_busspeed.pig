-------------------------------------------------------------------------------
--
-- Urban Science Intensice
-- sort_ave_busspeed.pig
-- Simply sort and count average of values
-- contact: drp354@nyu.edu
--
-------------------------------------------------------------------------------

-- load the data
-- in1 = LOAD 'BusSpeed/output1/' 
in1 = LOAD 'BusSpeed/out-temp-all/' AS (id:chararray,time:float, distance:float);

-- group by id
grpd  = GROUP in1 BY (id);
ave  = FOREACH grpd GENERATE group, ( AVG(in1.time) / AVG(in1.distance) );
-- ave  = FOREACH grpd GENERATE group, AVG(in1.time);

-- sort the output
 ave1_ordered = ORDER ave BY group DESC;

-- store the data
STORE ave1_ordered INTO 'BusSpeed/output-pig-all-test2/' USING PigStorage ('\t');


