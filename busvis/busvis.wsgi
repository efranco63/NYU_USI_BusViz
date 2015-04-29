#!/usr/bin/python

import sys
import logging

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/var/www/html/busvis/")

#from FlaskApp import app as application
from busvis import app as application
