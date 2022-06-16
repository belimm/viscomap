import os
from flask import render_template,request,jsonify,redirect,url_for,session,flash
from flask_login import login_required, logout_user
from datetime import date
import json
from app import app
import re
from webCrawler import *
import pyrebase
from functools import wraps
import urllib.parse
from encode import *
from decode import *
import uuid
import time
from findOldProject import *


config ={
    "apiKey": "AIzaSyA94-olAeO0kcPL5YPVAjSo5-3XGQDNu9M",
    "authDomain": "viscomap-7b882.firebaseapp.com",
    "databaseURL": "https://viscomap-7b882-default-rtdb.europe-west1.firebasedatabase.app",
    "projectId": "viscomap-7b882",
    "storageBucket": "viscomap-7b882.appspot.com",
    "messagingSenderId": "534515162455",
    "appId": "1:534515162455:web:33b03117f1816b88603212",
    "measurementId": "G-1ZMCBC6ZBD"
}
firebase = pyrebase.initialize_app(config)
auth = firebase.auth()
db = firebase.database()

session = {"logged_in": False, "email": "", "uid": ""}
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if auth.current_user != None:
            return f(*args, **kwargs)
        else:
            
            return render_template('loginReq.html',auth=auth)

    return wrap


allProjects = []
Depth = 1
Projects = {"":""}
flag = 0
loginFlag = 0
today = date.today()
headings = ("Sub URL", "Complexity Score", "Complexity Range")



@app.route('/')
def index():
    msg = ''
    session['logged_in'] = False
    return render_template('MainPage.html', msg = msg, auth = auth)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST' and 'email' in request.form and 'password' in request.form:
        email = request.form['email']
        password = request.form['password']
        try:
            #Try signing in the user with the given information
            user = auth.sign_in_with_email_and_password(email, password)
            #Insert the user data in the global person
            session["logged_in"] = True
            session["email"] = user["email"]
            session["uid"] = user["localId"]
            data = db.child("users").get()
            session["name"] = data.val()[session["uid"]]["name"]
            #Redirect to welcome page
            return redirect(url_for('Home'))
        except:
            #If there is any error, redirect back to login
            return redirect(url_for('index'))
    

@app.route('/logout')
@login_required
def logout():
    auth.current_user = None
    return redirect('/')
    
@app.route('/register',methods = ['GET','POST'])
def register():

    if request.method == "POST" and 'username' in request.form and 'name' in request.form  and 'password' in request.form and 'email' in request.form:        #Only listen to POST
        username = request.form['username']
        name = request.form['name']
        password = request.form['password']
        email = request.form['email']

        try:
            #Try creating the user account using the provided data
            auth.create_user_with_email_and_password(email, password)
            #Login the user
            user = auth.sign_in_with_email_and_password(email, password)
            #Add data to global person
            #session["logged_in"] = True
            session["email"] = user["email"]
            session["uid"] = user["localId"]
            
            #Append data to the firebase realtime database
            data = {"name": name, "email": email, "username": username,"password": password, "projects": []}
            db.child("users").child(session["uid"]).set(data)
            
            #Go to welcome page
            return redirect(url_for('index'))
        except:
            #If there is any error, redirect to register
            
            return redirect(url_for('Features'))


@app.route('/Home', methods=['GET', 'POST'])
def Home():
    if auth.current_user:
        return render_template('home.html',auth = auth)
    else:
        return redirect(url_for('index'))

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    return render_template('profile.html', userInfo = session,auth = auth)

@app.route('/editProfile', methods=['GET', 'POST'])
@login_required
def editProfile():
    eror = {"password":"", "email":"", "success":""}
    print(session["logged_in"])
    if request.method == 'POST' and 'username' in request.form and 'name' in request.form  and 'password' in request.form and 'email' in request.form :
        username = request.form['username']
        name = request.form['name']
        password = request.form['password']
        email = request.form['email']

        user = auth.sign_in_with_email_and_password(session["email"], password)
        
        print(user)
        print(session["email"])
        print(session["uid"])
        print(session["name"])
        print(session["username"])
        print(session["password"])

     
        if user:
            if username:
                editedusername = username
            else:
                editedusername = user['username']
            if name:
                editedname = name
            else:
                editedname = user['name']
            if password and (password != user['password']):
                editedpassword = password
            elif password == user['password']:
                eror["password"] = 'Please enter a new password ! Your password is the same as your old password !'
            else:
                editedpassword = user['password']
            
            if not re.match(r'[^@]+@[^@]+\.[^@]+', email) and email:
                editedemail = user['email']
                eror["email"] = 'Please enter a valid email address !'
            elif email and re.match(r'[^@]+@[^@]+\.[^@]+', email):
                editedemail = email
            else: 
                editedemail = user['email']
            if eror["password"] or eror["email"]:
                return render_template('editProfile.html', eror = eror)
            else:
                try:
                    data = {"name": editedname, "email": editedemail, "username": editedusername,"password": editedpassword}
                    db.child("users").child(session["uid"]).update(data)
                    if not name and not password and not email and not username:
                        return redirect(url_for("profile"))
                    eror["success"] = 'You have successfully edited your profile !'
                except Exception as e:
                    print(e)
                    return render_template('editProfile.html',auth = auth)
        eror["password"] = False
        eror["email"] = False
        userCheck = False
        print(userCheck)
        return render_template('editProfile.html',eror = eror,auth = auth)
    return render_template('editProfile.html',eror = eror,auth = auth)
@app.route('/About', methods=['GET', 'POST'])
def About():

    return render_template('About.html',auth = auth)

@app.route('/Features', methods=['GET', 'POST'])
def Features():

    return render_template('Features.html',auth = auth)

@app.route('/Contact', methods=['GET', 'POST'])
def ContactUs():

    return render_template('ContactUs.html',auth = auth)

@app.route('/projects', methods=['GET', 'POST'])
@login_required
def projects():
    Depth = 1
    eror = None
    flag = 0
    allProjects = []
    allProjectsKeys = []
    allProjectsDict = {}
    
    if request.method == 'POST' and 'ProjectName' in request.form and 'urlAddress' in request.form and "Depth" in request.form:
        ProjectName = request.form['ProjectName']
        urlAddress = request.form['urlAddress']
        Depth = request.form['Depth']
        
        

        if not urlAddress or not ProjectName or not Depth:
            eror = 'Please fill out the form'
        elif not re.match(r'((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z]){2,6}([a-zA-Z0-9\.\&\/\?\:@\-_=#])*', urlAddress):
            eror = 'Please enter a valid URL'
        elif Depth.isdigit() == False or int(Depth) < 1 or int(Depth) > 2:
            eror = 'Please enter a valid Depth'
        else:
            
            if findOld(db,urlAddress, Depth,session["uid"]):
                return redirect(url_for("projects"))
            else:
                jsonData = {}
                flag = 1
                runCrawler(urlAddress,int(Depth))

                os.chdir("C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\metu-emine-role-detection-api-ee564a450501")
                os.system("node vcs-calculator.js")
                with open('C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\metu-emine-role-detection-api-ee564a450501\\jsonDictionary.json') as f:
                    jsonData = json.load(f)
                
                os.chdir("C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap")
                
                Uid = uuid.uuid4().hex
                jsonData["Depth"] = int(Depth)
                encodedJsonData = encodeURL(jsonData,int(Depth))

                urlUid = urllib.parse.quote(urlAddress, safe='').replace(".", "%2E%2E")
                print(type(urlUid))
                print("urladress",urlUid)
                db.child("projects").child(Uid).set(encodedJsonData)
                db.child("users").child(session["uid"]).child("projects").child(Uid).set(urlUid)

        return redirect(url_for("projects"))
        

        """
            modifedJsonData =  db.child("projects").child(Uid).get()
            print(json.dumps(modifedJsonData.val(), indent=4))
            decodedJsonData = decodeURL(modifedJsonData.val(),int(Depth))
            print("\n\n\n")
            print(json.dumps(decodedJsonData, indent=4))
            
            #db.child("projects").child(urlAddress).set(jsonData)
            #print(urllib.parse.quote(urlAddress, safe='').replace(".", "%2E%2E"))
            #print(urllib.parse.unquote(urlAddress).replace("%2E%2E", "."))   

        """
    
    Projects = db.child("users").child(session["uid"]).child("projects").get()

    for project in Projects.each():

        #print(json.dumps(pro.val(), indent=4))
        
        decodedJsonData = urllib.parse.unquote(project.val()).replace("%2E","." )

        #print(json.dumps(decodedJsonData, indent=4))
        allProjects.append(decodedJsonData)
        allProjectsKeys.append(project.key())
        allProjectsDict[project.key()] = decodedJsonData
        
        #print("\n\n")
    #print(allProjects[0])
    return render_template('projects.html',auth = auth, allProjectsDict = allProjectsDict, eror = eror,Depth = Depth)

    #return render_template('projects.html',auth = auth, allProjectsDict = allProjectsDict, eror = eror,Depth = Depth)

    
    
    
@app.route("/<string:uid>", methods=['GET', 'POST'])
@login_required
def project(uid):
    project = db.child("projects").child(uid).get()
    Depth = project.val()["Depth"]
    
    decodedProject = decodeURL(project.val(),Depth)

    with open('C:\\Users\\IRPHAN\\Documents\\GitHub\\viscomap\\static\\ProjectFile.json','w') as f:
        json.dump(decodedProject, f, indent=4)
    return render_template('project.html', headings = headings ,project =decodedProject, auth = auth, Depth = int(Depth))

@app.route('/visualization', methods=['GET', 'POST'])
@login_required
def visualization():
    return render_template('visualization.html',auth = auth)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
