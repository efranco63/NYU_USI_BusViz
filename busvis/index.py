###############################################################################
##
## index.py
## fimport Flask module and handle webserver requests
## by Renate Pinggera
##
###############################################################################


from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask import render_template

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/bushistorical'
db = SQLAlchemy(app)

@app.route('/')
def index():
	import psycopg2;
	#date=raw_input('enter date: (2014-08-01)\n').strip()
	try:
		conn=psycopg2.connect("dbname='bushistorical' user='postgres'")
	except:
		print '<html><body><p>could not connect to database</p></body></html>'
	cur=conn.cursor()
	# cur.execute("""SELECT COUNT(*)FROM(SELECT busid,COUNT(*) bus_count FROM bus_test WHERE to_char(TIMESTAMP,'YYYY-MM-DD') ='%s' GROUP BY busid) AS table1"""%(date))
	cur.execute("SELECT COUNT(DISTINCT busid) FROM bus_test");
	rows=cur.fetchall()

	#return '<html><body><p>see what we got: ' + str(int(rows[0][0])) + '</p></body></html>'
        return render_template('index.html', buscount = int(rows[0][0]))


    # return render_template('index.html')

# @app.route('/hello')
# def hello():
#     return 'Hello World'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug = True)
    #app.debug = True;
    # app.run()
