from flask_mysqldb import MySQL
from app import app

app.secret_key = "viscomap"
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = ""
app.config["MYSQL_DB"] = "viscomap"
app.config["MYSQL_CURSORCLASS"] ="DictCursor"

mysql = MySQL(app)