#!/usr/local/bin/python2.7

###############################################################################
##
## archive_bus_text.py
## fetch all bus data, simple plot and store it to text file
## MTA bus key = 4723b4b0-3e16-4a17-a24b-48d79ea53dc0
## contact: drp354@nyu.edu
##
###############################################################################

import urllib2,json,argparse,sys
import csv
import time
import datetime


def KeyCheck():
    """
    Checking whether API is valid
    """ 
    try:
        webUrl = urllib2.urlopen(urlData)
    except urllib2.HTTPError, e:
        print '[ERROR] Failed with error code - %s.' % e.code
        if e.code == 403:
            sys.exit("[ERROR] API key incorrect. Please try again")
        sys.exit()
  
def WebAccess():
    """
    accessing specified URL and fetch bus data
    """ 
    # Open the URL and read the data
    webUrl = urllib2.urlopen(urlData)
    #print (webUrl.getcode())
    if (webUrl.getcode() == 200):
        data = webUrl.read()
        #print "Read data finished"
    else:
        sys.exit("[ERROR] Received an error from server, cannot retrieve results " + str(webUrl.getcode()))   
    return data

       
def storeText(inData,filename):
    """
    store data to comma-delimited text file 
    """ 
    jsonData = json.loads(inData)  
    for i in jsonData["Siri"]["ServiceDelivery"]["VehicleMonitoringDelivery"]:
        for j in i["VehicleActivity"]:
            try:
                timestamp = j["RecordedAtTime"]
                lineref = j["MonitoredVehicleJourney"]["LineRef"]
                linename = j["MonitoredVehicleJourney"]["PublishedLineName"]
                vehicleref = j["MonitoredVehicleJourney"]["VehicleRef"]
                destref = j["MonitoredVehicleJourney"]["DestinationRef"]
                destname = j["MonitoredVehicleJourney"]["DestinationName"]
                latitude = j["MonitoredVehicleJourney"]["VehicleLocation"]["Latitude"]
                longitude = j["MonitoredVehicleJourney"]["VehicleLocation"]["Longitude"]
                row = [timestamp,lineref,linename,vehicleref,destref,destname,latitude,longitude]
                resultFile = open(filename,'a+w')
                wr = csv.writer(resultFile)
                wr.writerow(row)
                print '[INFO] successfully inserted bus %s at %s.' % (lineref,timestamp)
            except:
                print '[WARNING] Error when storing bus data, continue skipping. Error code - %s.' % (sys.exc_info()[0])
                pass

def timeDelay(sec):
    """
    insert time delay and print time for debugging purpose 
    """ 
    time.sleep(sec)

def main(bus_key):
    #update on 
    today = datetime.date.today()
    csv_filename = "bus-"+str(today)+".csv"

    #url data
    global urlData
    urlData = "http://api.prod.obanyc.com/api/siri/vehicle-monitoring.json?key="+bus_key
    #cheking API keys
    KeyCheck()
   
    while True:
        if today == datetime.date.today():
            pass
        else:
           today = datetime.date.today()
           csv_filename = "bus-"+str(today)+".csv"
        data = WebAccess()
        storeText(data,csv_filename)
        timeDelay(5)

if __name__ == '__main__':
    key = "4723b4b0-3e16-4a17-a24b-48d79ea53dc0"
    main(key)
