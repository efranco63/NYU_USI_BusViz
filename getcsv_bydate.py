import psycopg2,csv
date=raw_input('enter date: (2014-08-01)\n').strip()
try:
	conn=psycopg2.connect("dbname='gis_test' user='postgres'")
except:
	print 'could not connect to database'
cur=conn.cursor()
cur.execute("""select routeid,count(*) bus_count from bus_test where to_char(timestamp,'YYYY-MM-DD') ='%s' group by routeid;
"""%(date))
rows=cur.fetchall()
with open('/home/busvis/%s.csv'%(date),'w') as myfile:
	csv_out=csv.writer(myfile)
	csv_out.writerow(['bus_name','bus_count'])
	for row in rows:
		busname=row[0]
		try:
			busname=busname.split('_')[1]
		except:
			pass
		csv_out.writerow([busname,int(row[1])])
