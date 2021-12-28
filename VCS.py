from flask import Flask,render_template,request,jsonify,redirect,url_for,session,flash
from wtforms import Form,StringField,validators,PasswordField,EmailField
#from webCrawler import hrefList,depthList
import pandas as pd
from app import app
from db import mysql
import re
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "logged_in" in session:
            return f(*args, **kwargs)
        else:
            flash("bu sayfayı görüntülemek için giriş yapın", "danger")
            return redirect(url_for("login"))
    return decorated_function

class getURLForm(Form):
    url = StringField(label = "",validators=[validators.URL(require_tld= True,message="Please enter a valid URL")])



@app.route('/',methods = ['GET','POST'])
def register():
    msg = {"user":"", "formFill":"", "email":"","name":"","success":""}
   
    if request.method == 'POST' and 'username' in request.form and 'name' in request.form  and 'password' in request.form and 'email' in request.form :
        username = request.form['username']
        name = request.form['name']
        password = request.form['password']
        email = request.form['email']
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE email = % s', (username, ))
        user = cursor.fetchone()
        if user:
            msg["user"]= 'Account already exists !'  
        if not name and not password and not email and not username:
            msg["formFill"]='Please fill out the form !'        
        if not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg["email"]='Invalid email address !'
        else:
            cursor.execute('INSERT INTO users VALUES (NULL, % s, % s, % s)', (username,name, password, email, ))
            mysql.connection.commit()
            msg["success"] ='You have successfully registered !'
            return render_template('MainPage.html',msg = msg)
    return render_template('MainPage.html',msg = msg)



@app.route('/<username>', methods=['GET', 'POST'])
@login_required
def login(username):
    # Output message if something goes wrong...
    msg = ''
    # Check if "username" and "password" POST requests exist (user submitted form)
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        # Create variables for easy access
        username = request.form['username']
        password = request.form['password']
        # Check if user exists using MySQL
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password,))
        # Fetch one record and return result
        user = cursor.fetchone()
        # If user exists in user table in out database
        if user:
            # Create session data, we can access this data in other routes
            session['loggedin'] = True
            session['id'] = user['id']
            session['username'] = user['username']
            # Redirect to home page
            return 'Logged in successfully!'
        else:
            # user doesnt exist or username/password incorrect
            msg = 'Incorrect username/password!'
    # Show the login form with message (if any)
    return render_template('MainPage.html', msg=msg)



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