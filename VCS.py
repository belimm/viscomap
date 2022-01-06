from os import error
from flask import Flask,render_template,request,jsonify,redirect,url_for,session,flash
from wtforms import Form,StringField,validators,PasswordField,EmailField
from flask_login import login_required, logout_user
#from webCrawler import hrefList,depthList
import pandas as pd
from app import app
from db import mysql
import re


from functools import wraps
from flask_login import login_manager, login_required, logout_user


def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get('logged_in'):
            return f(*args, **kwargs)
        else:
            flash('You need to login first')
            return redirect(url_for('login'))

    return wrap

headings = ("Project Name", "URL", "Address Name", "Complexity Value", "Creation Date")
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
    if request.method == 'POST' and 'ProjectName' in request.form and 'urlAddress' in request.form  and 'urlAddressName' in request.form:
        ProjectName = request.form['ProjectName']
        urlAddress = request.form['urlAddress']
        urlAddressName = request.form['urlAddressName']
        data = [ProjectName,urlAddress,urlAddressName]
        resp = jsonify(data)
        resp.status_code = 200
        flash('You have successfully added a new URL !')
    cursor = mysql.connection.cursor()
    sql = "SELECT * FROM projects WHERE user_id = % s" % session['id']
    cursor.execute(sql)
    data = cursor.fetchall()
    cursor.close()
    return render_template('projects.html', data = data)
    
@app.route("/project/<string:id>")
def project(id):
    cursor = mysql.connection.cursor()
    sql = "SELECT * FROM projects WHERE project_id = % s" % id
    cursor.execute(sql)
    project = cursor.fetchone()
    cursor.close()
    return render_template('project.html', project = project)

        
   
    
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