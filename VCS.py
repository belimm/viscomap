from flask import Flask,render_template,request,jsonify,redirect,url_for
from wtforms import Form,StringField,validators
#from webCrawler import hrefList,depthList
import pandas as pd
from app import app
from db import mysql

class getURLForm(Form):
    url = StringField(label = "",validators=[validators.URL(require_tld= True,message="Please enter a valid URL")])


@app.route('/',methods = ['GET','POST'])
def getURL():
    form = getURLForm(request.form)

    if request.method == 'POST' and form.validate():
        try:
            url = form.url.data
            cursor = mysql.connection.cursor()
            conn = "INSERT INTO webpage(url) VALUES(%s)"
            cursor.execute(conn,(url,))
            mysql.connection.commit()
            return redirect(url_for("getURL"))
        except:
            return "Error"
        finally:
            if cursor:
                cursor.close()
        
    else:
        pass
    return render_template('MainPage.html',form = form)


if __name__ == '__main__':
    app.run(debug=True)
   