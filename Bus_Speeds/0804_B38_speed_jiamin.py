
# coding: utf-8

# In[1]:

get_ipython().magic(u'matplotlib inline')
from pandas import DataFrame as df
import pandas as pd
from datetime import datetime as dt
import numpy as np


# In[2]:

bus_oneday=df.from_csv('MTA-Bus-Time_.2014-08-04.txt',sep='\t',index_col='inferred_trip_id')


# In[3]:

B38_0804=bus_oneday[(bus_oneday['inferred_direction_id']==0)  & (bus_oneday['inferred_route_id']=='MTA NYCT_B38')&                    (bus_oneday['next_scheduled_stop_id']!='nan')]
B38_0804=B38_0804.dropna()


# In[4]:

B38_0804['next_scheduled_stop_id']=B38_0804['next_scheduled_stop_id'].apply(lambda x:int(x.split('_')[1]))
B38_0804['time_received']=B38_0804['time_received'].apply(lambda x:dt.strptime(x.strip(),'%Y-%m-%d %H:%M:%S'))


# In[5]:

B38_0804=B38_0804.sort(['vehicle_id','next_scheduled_stop_id','time_received'])


# In[6]:

print B38_0804[['vehicle_id','next_scheduled_stop_id','time_received','next_scheduled_stop_distance']]


# In[7]:

take_first=B38_0804[['vehicle_id','next_scheduled_stop_id','time_received','next_scheduled_stop_distance']].drop_duplicates(subset=['vehicle_id','next_scheduled_stop_id'])
take_last=B38_0804[['vehicle_id','next_scheduled_stop_id','time_received','next_scheduled_stop_distance']].drop_duplicates(subset=['vehicle_id','next_scheduled_stop_id'],take_last=True)


# In[8]:

print len(take_first.index),len(take_last.index)


# In[9]:

time_dur=pd.merge(take_first,take_last,on=['vehicle_id','next_scheduled_stop_id'])


# In[10]:

time_dur


# In[11]:

time_dur['distance']=time_dur.next_scheduled_stop_distance_x-time_dur.next_scheduled_stop_distance_y
time_dur['time']=(time_dur.time_received_y-time_dur.time_received_x)/np.timedelta64(3600,'s')
time_dur['time'][time_dur['time']==0]=0.000001


# In[12]:

time_dur['speed']=time_dur['distance']/time_dur['time']/1000


# In[13]:

time_dur


# In[14]:

speed=time_dur[['speed','vehicle_id']]
speed.index=time_dur['next_scheduled_stop_id']


# In[18]:

speed.to_csv('0804_B38_speed.csv')


# In[17]:

speed.sort('speed',ascending=False)


# In[ ]:




# In[ ]:



