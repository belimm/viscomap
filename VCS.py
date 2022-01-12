import os
from flask import render_template,request,jsonify,redirect,url_for,session,flash
from wtforms import Form,StringField,validators,PasswordField,EmailField
from flask_login import login_required, logout_user
import pandas as pd
from datetime import date
import json
from app import app
from db import mysql
import re
import sys
import matplotlib.pyplot as plt
from webCrawler import crawl
#import Mapping
#import mysql.connector
from functools import wraps


def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get('logged_in'):
            return f(*args, **kwargs)
        else:
            flash('You need to login first')
            return redirect(url_for('login'))

    return wrap

today = date.today()
headings = ("Sub URL", "Complexity Score", "Complexity Range")
class getURLForm(Form):
    url = StringField(label = "",validators=[validators.URL(require_tld= True,message="Please enter a valid URL")])

@app.route('/')
def index():
    msg = ''
    session['logged_in'] = False
    return render_template('MainPage.html', msg = msg)

@app.route('/login', methods=['GET', 'POST'])
def login():
    msg = ''
    if request.method == 'POST' and 'email' in request.form and 'password' in request.form:
        email = request.form['email']
        password = request.form['password']
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE email = % s AND password = % s', (email, password, ))
        user = cursor.fetchone()
        if user:
            session['logged_in'] = True
            session['id'] = user['user_id']
            session['email'] = user['email']
            return redirect(url_for("Home"))
        else:
            msg = 'Incorrect username / password !'
            return redirect(url_for("index"))
    if session.get('logged_in'):
        flash('You have been automatically logged out.')
        del session['logged_in']
    return render_template('MainPage.html', msg = msg)

@app.route('/logout')
@login_required
def logout():
    session.clear()
    if session.get('logged_in'):
        # prevent flashing automatically logged out message
        del session['logged_in']
    flash('You have successfully logged yourself out.')
    return redirect('/')
    
@app.route('/register',methods = ['GET','POST'])
def register():
    msg = {"user":"", "formFill":"", "email":"","name":"","success":""}
   
    if request.method == 'POST' and 'username' in request.form and 'name' in request.form  and 'password' in request.form and 'email' in request.form :
        username = request.form['username']
        name = request.form['name']
        password = request.form['password']
        email = request.form['email']
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE username = % s', (username, ))
        user = cursor.fetchone()
        if user:
            msg["user"]= 'Account already exists !'  
        elif not name and not password and not email and not username:
            msg["formFill"]='Please fill out the form !'        
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg["email"]='Invalid email address !'
        else:
            try:
                cursor.execute('INSERT INTO users VALUES (NULL,%s, % s, % s, % s)', (username,name, email,password,  ))
                mysql.connection.commit()
                msg["success"] ='You have successfully registered !'
            except:
                msg["success"] ='Something went wrong !'
                mysql.connection.rollback()
                return redirect(url_for("index"))
            finally:
                cursor.close()
    return render_template('MainPage.html',msg = msg)
    


@app.route('/Home', methods=['GET', 'POST'])
@login_required
def Home():
    #form = getURLForm(request.form)

    return render_template('Home.html')


@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    cursor = mysql.connection.cursor()
    
    sql = "SELECT * FROM users WHERE user_id = % s" % session['id']
    cursor.execute(sql)
    userInfo = cursor.fetchone()
    cursor.close()
    return render_template('profile.html', userInfo = userInfo)

@app.route('/projects', methods=['GET', 'POST'])
@login_required
def projects():
    #crawledList = None
    cursor = mysql.connection.cursor()
    sql1 = "SELECT * FROM users WHERE user_id = % s" % session['id']
    cursor.execute(sql1)
    user = cursor.fetchone()
    name = user['username']
    if request.method == 'POST' and 'ProjectName' in request.form and 'urlAddress' in request.form and "Depth" in request.form:
        ProjectName = request.form['ProjectName']
        urlAddress = request.form['urlAddress']
        Depth = request.form['Depth']
        data = [ProjectName,urlAddress]
        resp = jsonify(data)
        resp.status_code = 200
        flash('You have successfully added a new URL !')
        mapDataFrame = pd.read_csv('deneme.csv')
        """"
        print(type(urlAddress), file=sys.stdout)
        print(urlAddress, file=sys.stdout)
        a = crawl(urlAddress,Depth)
        print(a, file=sys.stdout)

        os.chdir("C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\metu-emine-role-detection-api-ee564a450501")
        os.system("node vcs-calculator.js")
        with open('C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\metu-emine-role-detection-api-ee564a450501\\jsonDictionary.json') as f:
            data = json.load(f)
        print(data, file=sys.stdout)
        print(type(data), file=sys.stdout)
        print(data.keys(), file=sys.stdout)
        print(data.values(), file=sys.stdout)
        #print(jsondf, file=sys.stdout)
        os.chdir("C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap")
        #print(crawledList, file=sys.stdout)
        #print(jsondf.iloc[[0]], file=sys.stdout)
        mapDataFrame = pd.DataFrame(columns=['dept_1','complexity_score'])
        
        #count_row  = jsondf.shape[1]
        for keys, value in data.items():
            mapDataFrame.loc[len(mapDataFrame)] = [keys,value]
        #for col in jsondf.columns:
         #   print(col, file=sys.stdout)
         """
        complexity_score = mapDataFrame["complexity_score"].mean()
        print(complexity_score, file=sys.stdout)
        #mapDataFrame.insert(0,'URL', urlAddress)
        #mapDataFrame.to_csv("deneme.csv", index=False)
        #print(url, file=sys.stdout)
        if not mapDataFrame.empty:
            date = today.strftime("%Y/%m/%d")

        print(mapDataFrame, file=sys.stdout)
        #Mapping.plotMap(mapDataFrame,ProjectName)
        #mapDataFrame.concat(jsondf,ignore_index=True)
        #df.loc[:, df.columns != 'b']
        
        print("NOOOOOOOOOOOOOT HEREEEEEEEEEEE", file=sys.stdout)  
        try:
            cursor.execute('INSERT INTO projects VALUES (NULL,%s, %s, %s, %s, %s)', (ProjectName,complexity_score, urlAddress,date,session['id'], ))
            mysql.connection.commit()
            project_id = cursor.lastrowid
            
            for index, row in mapDataFrame.iterrows():
                print(f"test in row {index}")
                range = ""
                if int(row['complexity_score']) <3:
                    range = "Low"
                elif int(row['complexity_score']) <5:
                    range = "Medium"
                elif int(row['complexity_score']) <7:
                    range = "High"
                else:
                    range = "Very High"
                print(row['dept_1'], file=sys.stdout)
                print(row['complexity_score'], file=sys.stdout)
                print(range, file=sys.stdout)
                
                print(project_id, file=sys.stdout)
                urlString = str(row['dept_1'])
                complexString = str(row['complexity_score'])
                try:
                    
                    print("GIRMELLIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII", file=sys.stdout)
                    cursor.execute('INSERT INTO subsites VALUES (NULL, %s, %s, %s, %s)', (urlString, complexString, range, project_id))
                    print("GIRMELLIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII", file=sys.stdout)
                    mysql.connection.commit()
                    
                except:
                    mysql.connection.rollback()
                    return redirect(url_for("projects"))
        except:
            
            mysql.connection.rollback()
            return redirect(url_for("projects"))
        
    #print(mapDataFrame, file=sys.stdout)
    #Mapping.plotMap(jsondf,name)
    

    sql = "SELECT * FROM projects WHERE user_id = % s" % session['id']
    cursor.execute(sql)
    data = cursor.fetchall()
    cursor.close()
    return render_template('projects.html',  data = data ,user = user)
    
@app.route("/<string:id>", methods=['GET', 'POST'])
@login_required
def project(id):
    cursor = mysql.connection.cursor()
    sql = "SELECT * FROM projects WHERE project_id = % s" % id
    cursor.execute(sql)
    project = cursor.fetchone()
    
    
    subSql = "SELECT * FROM subsites WHERE project_id = % s" % id
    cursor.execute(subSql)
    sublist = cursor.fetchall()
    cursor.close()
    if sublist:
        df = pd.DataFrame(sublist, columns=["subsite_url","complexity_score", "complexity_range", "project_id"])
    else:
        df = pd.DataFrame(columns=["subsite_url","complexity_score", "complexity_range", "project_id"])
    
    
    return render_template('project.html', headings = headings ,project = project,df = df)


        
   
    
    #df = pd.DataFrame(data, columns=["project_id","project_name", "url_address", "url_address_name", "complexity_value", "create_date","user_id"])
    #return render_template('Profile.html', df = df, headings = headings)


if __name__ == '__main__':
    app.run(debug=True)
   
"""
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
"""