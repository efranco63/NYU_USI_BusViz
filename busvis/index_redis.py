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
	stop_id = "MTA_" + str(stop_id)		# stop_id = "MTA_803008"

	## Testing reading file from stop id

	#	import read_1day_json 
	# stop_id_json = read_1day_json.readStopId(stop_id)
	# # print stop_id_json
	# return jsonify(stop_id_json)
	# testing redis 
	import redis
	import ast 

	pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
	r = redis.Redis(connection_pool=pool)
	stop_id_json=r.hget('stopid',stop_id)
	stop_id_json = ast.literal_eval(str(stop_id_json))
	return jsonify(stop_id_json)


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



