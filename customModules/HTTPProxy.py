"""HTTPProxy class"""

#from Utils import Namespace, MimetypeSelector, EnvironmentFactory
import requests
from os.path import isfile, join, exists
from os import getcwd
import os
import sys
import json

class HTTPProxy:
	settings = {}
	basedir = "components/proxies/"
	configfilename = "config.json"

	def __init__(self, settings, app=None):
		self.settings = settings
	
	def operations(self):
		print "hola Proxies"

	def test(self, r):
		myPath = r["localUri"].replace(self.settings["ns"]["local"], "", 1).split("/")
		file = myPath.pop(0)
		if exists(self.basedir + file):
			return {"accepted": True, "url": r["localUri"]}
		return {"accepted": False}

	def execute(self, req):
		myresponse = {}
		myresponse["status"] = "error"
		myPath = req["url"].replace(self.settings["ns"]["local"], "", 1).split("/")
		componentDir = self.basedir + myPath[-1]
		configFile = componentDir+"/"+self.configfilename
		try:
			aix = open(configFile, "r")
			config = json.load(aix)
		except Exception, e:
			print sys.exc_info()
			myresponse["msg"] = "No config file for this component "
			return {"content": json.dumps(myresponse), "status": 500}
		if "url" not in config:
			myresponse["msg"] = "No url configured for this component"
			return {"content": json.dumps(myresponse), "status": 500}
		params = None
		if "params" in config:
			params = config["params"]
		r = requests.get(config["url"], params=params)
		myresponse["status"] = "ok"
		return {"content": r.text, "mimetype": r.headers['Content-Type'] }


