from flask import Flask,render_template
#from webCrawler import hrefList,depthList
import pandas as pd

#df = pd.DataFrame([(depthList, hrefList) for depthList, hrefList in zip(depthList,hrefList)],columns=['depth','URL'])
"""
tfile = open('result.txt', 'a')
tfile.write(df.to_string())
tfile.close()
"""

app = Flask(__name__, template_folder= 'templates', static_folder= 'static')



@app.route('/',methods = ['GET', 'POST'])
def index():
    return render_template('MainPage.html')



if __name__ == '__main__':
    app.run(debug=True)
   