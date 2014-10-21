import sys, os
from flask import Flask, request, redirect, url_for, send_from_directory, session, escape, render_template
from werkzeug import secure_filename
import csv


UPLOAD_FOLDER = '/tmp'
# UPLOAD_FOLDER = '/Users/nloira/projects/cognita/poderoeditor/tmp'
ALLOWED_EXTENSIONS = set(['txt', 'csv'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# SVN

class CSVHandler():
    def __init__(self, filename):
        # check if file exists

        if not os.path.isfile(filename):
            raise IOError("File not found")

        # open carefully to take care of encodings
        csvfd = open(filename, 'rb')

        # now, sniff the CSV dialect used by this file
        dialect = csv.Sniffer().sniff(csvfd.read(2048))
        csvfd.seek(0)

        # second round only to get number of columns
        reader = csv.reader(csvfd, dialect)
        first_row = reader.next()
        self.NF = len(first_row)

        # let's start again
        csvfd.seek(0)
        reader = csv.reader(csvfd, dialect)

        self.csvfd = csvfd
        self.reader = reader

    def reader(self):
        if self.reader != None:
            return self.reader

    def next(self):
        if self.reader != None:
            row = self.reader.next()
            if row == None:
                return None

            unirow = [ s.decode("utf-8") for s in row]
            return unirow

    def close(self):
        if self.csvfd != None:
            self.csvfd.close()

    def head(self, n):
        assert isinstance(n, (int, long))
        for i in range(n):
            yield self.next()

# ONTOLOGIES

def getOntologyClasses():
    allTerms = []
    with open('terms.txt') as terms:
        for line in terms:
            allTerms.append(line[:-1])
    return allTerms

# WEB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/csvuploaded')
def uploaded():

    error = None

    filename = escape(session['csvname'])
    if filename == None:
        error = "Session error: filename is empty!"
        return render_template('csvpreview.html', error=error)


    # check for valid csv
    try:
        csv = CSVHandler(UPLOAD_FOLDER+"/"+filename)
    except IOError:
        return "File not found!"
    except:
        return "Unexpected error: " + sys.exc_info()[0]

    data = csv.head(20)

    # get ontology terms
    allTerms=getOntologyClasses()

    # app.logger.debug(">>>"+str(csv.NF))

    # generate output
    msg = "File ("+filename+") uploaded. Congratulations!"

    # render template
    r = render_template('csvpreview.html', msg=msg, data=data, terms=allTerms, ncols=csv.NF)

    # close the CSV reader
    csv.close()

    return r


@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # return redirect(url_for('uploaded_file', filename=filename))
            session['csvname'] = filename
            return redirect(url_for('uploaded'))

    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form action="" method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

if __name__ == '__main__':
    app.secret_key = '\xa0\xeciI\x8a\xd3\x8a0\x16\xa6\xfe\xac\\\x94\xee\x07\xffN\x93\xc5\x85\xa4!\xc4'
    app.debug = True
    app.run()
