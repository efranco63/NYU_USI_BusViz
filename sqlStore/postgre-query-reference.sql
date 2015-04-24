select count(*) 
from bus 
where busid=311 and date_trunc('hour', timestamp) >='2014-08-01 04:00:00' 
and date_trunc('hour', timestamp)< '2014-08-01 05:00:00';

select count(*) 
from bus 
where routeid='MTA NYCT_B54' 
and  date_trunc('hour', timestamp) >='2014-08-01 04:00:00' 
and  date_trunc('hour', timestamp)< '2014-08-01 05:00:00';

select * 
from bus B, street  S 
where B.sdpoint=S.geom limit 2;

select sdpoint, timestamp 
from bus where busid=311 limit 2;

--distance in degree
select ST_Distance(sdpoint, ST_GeometryFromText('POINT(-73.987148 40.693298)', 4326)) 
as currentD 
from bus_test 
where routeid='MTA NYCT_B54' 
order by currentD ASC 
limit 10;

--distance in meters
SELECT ST_Distance(ST_Transform(sdpoint, 26986), ST_Transform(ST_GeometryFromText('POINT(-73.987148 40.693298)', 4326), 26986)) as currentDistance 
from bus_test 
where routeid='MTA NYCT_B54' 
order by currentDistance ASC 
limit 10;

--
SELECT timestamp, busid, ST_Distance(ST_Transform(sdpoint, 26986), ST_Transform(ST_GeometryFromText('POINT(-73.987148 40.693298)', 4326), 26986)) 
as currentDistance 
from bus_test where routeid='MTA NYCT_B54' 
order by currentDistance ASC 
limit 10;
