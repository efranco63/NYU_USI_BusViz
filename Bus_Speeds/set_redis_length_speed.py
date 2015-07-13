import redis
from pandas import DataFrame as df
redis_table=df.from_csv('redis_table.csv')
r = redis.StrictRedis(host='localhost', port=6379, db=10)
for i in redis_table.index:
	key=redis_table.ix[i][0]
	values=str(redis_table.ix[i][1])+'|'+str(redis_table.ix[i][2])
	r.hset('length_speed',key,values)