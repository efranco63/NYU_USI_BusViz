###############################################################################
##
## index.py
## fimport Flask module and handle webserver requests
## by Renate Pinggera
##
###############################################################################


from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

## for DB access:
# from flask.ext.sqlalchemy import SQLAlchemy
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/bushistorical'
# db = SQLAlchemy(app)

@app.route('/_get_waittimes')
def get_waittimes():
	stop_id = request.args.get('stop_id', '', type=str)
	date_stop_id_key = "2014-08-04-" + str(stop_id)		# stop_id = "803008"

	# query data from redis DB
	import redis
	import ast 

	# ___________________________________________________
	# OLD ---- OLD ---- OLD ---- OLD ---- OLD ---- OLD
	# SPRINT 3: OLD: query redis data from database 0 for waittimes of Aug 4, 2014
	#pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
	# pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=0)
	# r = redis.Redis(connection_pool=pool)
	# stop_id_json=r.hget('stopid',stop_id)
	# stop_id_json = ast.literal_eval(str(stop_id_json))
	# return jsonify(stop_id_json)

	# ___________________________________________________
	# SPRINT 4: query redis data from database 9 (Ed)
	# where date+stop are key, route the field, and times the values
	#pool = redis.ConnectionPool(host='localhost', port=6379, db=9)
	pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=9)
	r = redis.Redis(connection_pool=pool)
	#print "date_stop_id_key: ", str(date_stop_id_key)
	date_stop_id_json=r.hgetall(date_stop_id_key)

	import prepare_stop_id_json_for_histogram
	# transform from 2014-08-04-MTA_100027.json to 2014-08-04-MTA_100027_transformed.json
	date_stop_id_json_js = prepare_stop_id_json_for_histogram.transformJsonForJs(date_stop_id_json)

	return jsonify(date_stop_id_json_js)

	# ___________________________________________________
	# SPRINT 5: query redis DB for bus route speed from database 10 (Jiamin)
	# pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=10)
	# r = redis.Redis(connection_pool=pool)
	# busroute = r.hget('length_speed','MTA NYCT_B38')
	# print "-------- RP: bus routes ------------"
	# print busroute
	# return jsonify(stop_id_json)

@app.route('/_get_busspeed')
def get_busspeed():
	import get_speed_redis

	route_id = request.args.get('route_id', '', type=str)
	redis_output = get_speed_redis.loadRedis(route_id)

	return str(redis_output)


@app.route('/')
def index():
	date = "2014-08-04"
	## access Postgres DB
	## quick and dirty first draft - TODO configure so we can also use localhost DBs
	## research if Flask's SQLAlchemy module is better than psycopg2
	## find file structure to separate DB config, queries and Python code

	################## PostGre Test ############################################
	## TODO: Retrieve date from frontend input field
	

	#import psycopg2
	#date=raw_input('enter date: (2014-08-01)\n').strip()

	#commented for development
	#try:
	#	conn=psycopg2.connect("dbname='bushistorical' user='postgres' host='busvis.cloudapp.net'")
	#	cur=conn.cursor();
		# cur.execute("""SELECT COUNT(*)FROM(SELECT busid,COUNT(*) bus_count FROM bus_test WHERE to_char(TIMESTAMP,'YYYY-MM-DD') ='%s' GROUP BY busid) AS table1"""%(date))
	#	cur.execute("SELECT COUNT(DISTINCT busid) FROM bus_test")
	#	rows=cur.fetchall()
	#	totalBusCount = int(rows[0][0])

	#except:
		## if not able to connect to DB use static fake number - TODO: change to error message
		# print '<html><body><p>could not connect to database</p></body></html>'
		#totalBusCount = 10000

	#new line after development - remove after finish
	totalBusCount = 10000

	## send variable buscount to be shown inside /templates/index.html
	#return '<html><body><p>see what we got: ' + str(int(rows[0][0])) + '</p></body></html>'
	return render_template('index.html', date = date, buscount = totalBusCount)


if __name__ == '__main__':
	## prod server:
    app.run(host='0.0.0.0', port=5000, debug = True)

    ## localhost
    #app.run(port=5000, debug = True)



