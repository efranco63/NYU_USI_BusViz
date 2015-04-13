###############################################################################
##
## index.py
## fimport Flask module and handle webserver requests
## by Renate Pinggera
##
###############################################################################


from flask import Flask
from flask import render_template

app = Flask(__name__)

## for DB access:
# from flask.ext.sqlalchemy import SQLAlchemy
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/bushistorical'
# db = SQLAlchemy(app)

@app.route('/')
def index():

	## access Postgres DB
	## quick and dirty first draft - TODO configure so we can also use localhost DBs
	## research if Flask's SQLAlchemy module is better than psycopg2
	## find file structure to separate DB config, queries and Python code

	## TODO: Retrieve date from frontend input field
	date = "2014-08-04"

	import psycopg2
	#date=raw_input('enter date: (2014-08-01)\n').strip()
	try:
		conn=psycopg2.connect("dbname='bushistorical' user='postgres' host='busvis.cloudapp.net'")
		cur=conn.cursor();
		# cur.execute("""SELECT COUNT(*)FROM(SELECT busid,COUNT(*) bus_count FROM bus_test WHERE to_char(TIMESTAMP,'YYYY-MM-DD') ='%s' GROUP BY busid) AS table1"""%(date))
		cur.execute("SELECT COUNT(DISTINCT busid) FROM bus_test")
		rows=cur.fetchall()
		totalBusCount = int(rows[0][0])

	except:
		## if not able to connect to DB use static fake number - TODO: change to error message
		# print '<html><body><p>could not connect to database</p></body></html>'
		totalBusCount = 10000

	## send variable buscount to be shown inside /templates/index.html
	#return '<html><body><p>see what we got: ' + str(int(rows[0][0])) + '</p></body></html>'
	return render_template('index.html', date = date, buscount = totalBusCount)


if __name__ == '__main__':
	## prod server:
    app.run(host='0.0.0.0', port=80, debug = True)

    ## localhost
    # app.run(port=5000, debug = True)



