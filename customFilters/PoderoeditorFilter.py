import string
import random

class PoderoeditorFilter():

	def HTMLInputTextWidget(pred=None, id=None):
		N = 10
		_id = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(N)) if id is None else id
		_pred = "" if pred is None else pred
		return """<input id="%s" data-predicate="%s" />""" % (_id, _pred)

	def HTMLInputTextareaWidget(pred=None, id=None, cols=20, rows=20):
		N = 10
		_id = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(N)) if id is None else id
		_pred = "" if pred is None else pred
		return """<textarea id="%s" cols="%d" rows="%d" data-predicate="%s"></textarea>""" % (_id, cols, rows, _pred)
