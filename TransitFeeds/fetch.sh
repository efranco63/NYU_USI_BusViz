#!/bin/bash
# http://transitfeeds.com/p/mta/80
# http://transitfeeds.com/p/mta/81
# http://transitfeeds.com/p/mta/82
# http://transitfeeds.com/p/mta/83
# http://transitfeeds.com/p/mta/84
# http://transitfeeds.com/p/mta/85

URL_PREFIX=http://transitfeeds.com
for i in {80..85}
do
    url=${URL_PREFIX}/p/mta/${i}
    page=`wget -O - $url`
    region=`echo "$page" | sed -nE 's|.*<h1>[^ ]+ (.*) GTFS</h1>.*|\1|p' | awk '{ print tolower($0) }' | sed 's/ /_/g'`
    mkdir -p ${i}_$region
    echo $region
    for p in `echo "$page" | sed -nE 's|.*href=".*(\?p=.*)".*|\1|p'`
    do
        purl=$url$p
        for durl in `wget -O - $purl | sed -nE 's|.*href="(.*/download)">Download</a>.*|\1|p'`
        do 
            furl=`curl -I ${URL_PREFIX}${durl} -s 2>&1| col -b | grep Location | cut -d" " -f 2`
            fn=`basename $furl`
            dt=${furl%%/$fn}
            dt=${dt##*/}
            fn=${i}_${region}/gtfs_${region}_${dt}.zip
            wget -c -O $fn $furl
        done
    done
done
