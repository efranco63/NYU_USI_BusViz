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
	date = "2014-08-06"
	stop_id = request.args.get('stop_id', '', type=str)
	date_stop_id_key = str(date) + "-" + str(stop_id)		# stop_id = "803008"

	# query data from redis DB
	import redis
	import ast 

	# ___________________________________________________
	# SPRINT 4: query redis data from database 9 (Ed) --> NEW VALUES in DB 7
	# where date+stop are key, route the field, and times the values
	#pool = redis.ConnectionPool(host='localhost', port=6379, db=9)
	pool = redis.ConnectionPool(host='busvis.cloudapp.net', port=6379, db=7)
	r = redis.Redis(connection_pool=pool)
	#print "date_stop_id_key: ", str(date_stop_id_key)
	date_stop_id_json=r.hgetall(date_stop_id_key)

	# transform from 2014-08-04-MTA_100027.json to 2014-08-04-MTA_100027_transformed.json
	import prepare_stop_id_json_for_histogram
	date_stop_id_json_js = prepare_stop_id_json_for_histogram.transformJsonForJs(date_stop_id_json)

	return jsonify(date_stop_id_json_js)


@app.route('/_get_busspeed')
def get_busspeed():
	import get_speed_redis

	route_id = request.args.get('route_id', '', type=str)
	redis_output = get_speed_redis.loadRedis(route_id)

	return jsonify(redis_output)


@app.route('/')
def index():
	date = "2014-08-04"
	#new line after development - remove after finish
	totalBusCount = 10000

	return render_template('index.html', date = date, buscount = totalBusCount)


if __name__ == '__main__':
	## prod server:
    app.run(host='0.0.0.0', port=5000, debug = True)

    ## localhost
    #app.run(port=5000, debug = True)



