###############################################################################
##
## blumaps_store_online.py
## fetch all bus data, simple plot and store it to postgre
## MTA bus key = 4723b4b0-3e16-4a17-a24b-48d79ea53dc0
## contact: drp354@nyu.edu
##
###############################################################################

import argparse
import time
import datetime
import psycopg2
import psycopg2.extras
from datetime import date,datetime,timedelta

#global init
start_date='2014-08-04'
end_date='2014-08-05'
startDate = datetime.strptime(start_date,"%Y-%m-%d")
endDate = datetime.strptime(end_date,"%Y-%m-%d")

def daterange(startDate, endDate):
  for n in range(int ((endDate - startDate).days)):
    yield startDate + timedelta(n)

  
notInList = ["2014-10-06","2014-10-17"]
      
def storePostgre(dataDir, fileName):

  #iterating each line from offline bus data  
  keyIdx = -1

  #connecting to postGres and write jsonData
  db = psycopg2.connect('dbname=bushistorical user=postgres')
  cur = db.cursor()
  
  for singleDate in daterange(startDate, endDate):

    #dates in string
    dateStr = singleDate.strftime("%Y-%m-%d") 
    if dateStr in notInList: pass

    #debug aonly
    #if (singleDate.strftime("%Y-%m-%d")) == "2014-08-02":
    #    break

    else:

      #open each data
      f = open(dataDir+"/"+fileName+dateStr+".txt")


      tempCounter = -1
      headerIdx = -1
      for line in f:
        tempCounter+=1
        tokenCount = -1
        keyIdx += 1
        headerIdx += 1
        if headerIdx == 0:
          pass
        else:
          line = line.strip()
          for tokens in line.split('\t'):
            tokenCount+=1
            if tokenCount == 0: 
              lat = tokens
            elif tokenCount == 1:
              lon = tokens
            elif tokenCount == 2:
              timeStamp = tokens
            elif tokenCount == 7:
              lineName = tokens      
            elif tokenCount == 3:
              busId = tokens

          # Use the json module to load the string data into a dictionary
          cur.execute("INSERT INTO bus_test(id,timestamp,routeid,latitude,longitude,busid) \
                       VALUES (%s,%s,%s,%s,%s,%s)",
                      (keyIdx,timeStamp,lineName,lat,lon,busId))
	  #query = "INSERT INTO bus (busnum, busid, busloc, bustimestamps, buslat, buslng, busroute) 
          #VALUES ('%s', '%s',ST_GeomFromText('Point(%f %f)', 4326), '%s', '%f', '%f', '%s')" % 
          #( i, z, bus[i][z][1], bus[i][z][0], bus[i][z][3], bus[i][z][1], bus[i][z][0],  bus[i][z][2])

          #debug file
          #print str(datetime.now())+("  : inserting file %s %d"%(dateStr,tempCounter))
           
          #For debug purpose only
          #if tempCounter==10:
          #  break
 
      db.commit()
      print str(datetime.now())+" data on date "+dateStr+" inserted successfully."

def main():
  fileName = "MTA-Bus-Time_."
  offlineDir = "."   

  storePostgre(offlineDir,fileName)
      
if __name__ == '__main__':
  main()
