"""Uploaders classes."""

#from Utils import Namespace, MimetypeSelector, EnvironmentFactory
from jinja2 import Template
from os.path import isfile, join, exists
from os import getcwd
import os
from werkzeug import secure_filename
import sys
from flask_login import session
import uuid
import json

class Uploaders:
	settings = {}
	basedir = "components/uploaders/"
	configfilename = "config.json"

	def __init__(self, settings, app=None):
		self.settings = settings

	def __getResourceType(self, uri):
		"""Returns the types of a URI"""
		types = []
		(results, first) = self.sparql.query("""
SELECT DISTINCT ?t
WHERE {
<%s> a ?t
}""" % (uri))
		for t in results["results"]["bindings"]:
			types.append(t["t"]["value"])
		return types

	def operations(self):
		print "hola Services"

	def test(self, r):
		myPath = r["localUri"].replace(self.settings["ns"]["local"], "", 1).split("/")
		file = myPath.pop(0)
		componentDir = self.basedir + file
		if exists(componentDir) and r["request"].method == 'POST':
				return {"accepted": True, "url": r["localUri"]}
		return {"accepted": False}

	def execute(self, req):
		file = req["request"].files['file']
		myresponse = {}
		myresponse["status"] = "error"
		filename = file.filename
		myPath = req["url"].replace(self.settings["ns"]["local"], "", 1).split("/")
		componentDir = self.basedir + myPath[-1]
		configFile = componentDir+"/"+self.configfilename
		extension = filename.rsplit('.', 1)[-1]
		try:
			aix = open(configFile, "r")
			config = json.load(aix)
		except Exception, e:
			print sys.exc_info()
			myresponse["msg"] = "No config file for this component "
			return {"content": json.dumps(myresponse), "status": 500}
		if "directory" not in config:
			myresponse["msg"] = "No file folder configured for this component"
			return {"content": json.dumps(myresponse), "status": 500}
		if "allowed_extensions" in config:
			if extension not in config["allowed_extensions"]:
				myresponse["msg"] = "File extension not allowed"
				return {"content": json.dumps(myresponse), "status": 400}

		newfilename = str(uuid.uuid4())+"."+extension
		file.save(os.path.join(config['directory'], newfilename))
		myresponse["status"] = "ok"
		if "show_url" not in configFile or configFile["show_url"] is False:
			myresponse["url"] = newfilename
		return {"content": json.dumps(myresponse), "mimetype": "application/json"}


