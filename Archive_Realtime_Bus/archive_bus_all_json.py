#!/usr/local/bin/python2.7

###############################################################################
##
## archive_bus_all_json.py
## fetch all bus data, simple plot and store it to json
## MTA bus key = 4723b4b0-3e16-4a17-a24b-48d79ea53dc0
## 
##
###############################################################################

import urllib2,json,argparse,sys
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
        pass
  
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
        return data
    else:
        print "[ERROR] Received an error from server, cannot retrieve results " + str(webUrl.getcode())   
        return -1
       
def storeText(inData,filename):
    """
    store all data to json file
    """ 
    jsonData = json.loads(inData)

    # must try-except each variable in order to prevent information loss
    try:
        timestamp = jsonData["Siri"]["ServiceDelivery"]["VehicleMonitoringDelivery"][0]["VehicleActivity"][0]["RecordedAtTime"]
    except:
        timestamp = ""     
    try:
        lineref = jsonData["Siri"]["ServiceDelivery"]["VehicleMonitoringDelivery"][0]["VehicleActivity"][0]["MonitoredVehicleJourney"]["LineRef"]
    except:
        lineref = ""

    with open(filename, "a+w") as json_file:
        json_file.write("{}\n".format(json.dumps(jsonData)))
        print '[INFO] successfully inserted bus %s at %s.' % (lineref,timestamp)
       # except:
       #      print '[WARNING] Error when storing bus data, continue skipping. Error code - %s.' % (sys.exc_info()[0])

def timeDelay(sec):
    """
    insert time delay and print time for debugging purpose 
    """ 
    time.sleep(sec)

def main(bus_key):
    #update on 
    print '############ PROGRAM START ############'
    today = datetime.date.today()
    json_filename = "bus-"+str(today)+".json"

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
           json_filename = "bus-"+str(today)+".json"
        data = WebAccess()
        if data != -1:
            storeText(data,json_filename)
        timeDelay(30)

if __name__ == '__main__':
    key = "4723b4b0-3e16-4a17-a24b-48d79ea53dc0"
    main(key)
