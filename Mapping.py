import os
os.environ["PATH"] += os.pathsep + 'C:\\Program Files\\Graphviz\\bin'
import networkx as nx
from networkx.drawing.nx_agraph import graphviz_layout
from pyvis.network import Network

from pylab import rcParams
import pandas as pd
import matplotlib.pyplot as plt


def plotMap(df,projectName):

    #df.loc[:, df.columns != 'b']
    paths = df.loc[:,'URL':].stack().groupby(level=0).agg(list).values.tolist()

    G = nx.DiGraph()

    for i,path in enumerate(paths):
        path[0] = 0
        path[1] = "{}".format(i+1,path[2])
        path[2] = "{:.2f}".format(path[2])

        nx.add_path(G, path)

    print(paths,type(paths))
    colors = [i/len(G.nodes) for i in range(len(G.nodes))]
    pos=graphviz_layout(G, prog='dot')
    nx.draw(G, pos=pos,
            node_color=colors, 
            node_size=1500,
            with_labels=True, 
            arrows=True)

    plt.savefig('static/images/'+ projectName +'.png')
    
    
  

    """
  colors = [i/len(G.nodes) for i in range(len(G.nodes))]
    pos=graphviz_layout(G, prog='circo')
    nx.draw(G, pos=pos,
            node_color=colors, 
            node_size=1500,
            with_labels=True, 
            arrows=True)
c

    with open(filepath, 'wb') as img:
    plt.savefig(img)
    plt.clf()

from flask import Flask, render_template, send_file
import matplotlib.pyplot as plt
from io import BytesIO
import networkx as nx


app = Flask(__name__)

@app.route('/<int:nodes>')
def ind(nodes):
    return render_template("image.html", nodes=nodes)

@app.route('/graph/<int:nodes>')
def graph(nodes):
    G = nx.complete_graph(nodes)
    nx.draw(G)

    img = BytesIO() # file-like object for the image
    plt.savefig(img) # save the image to the stream
    img.seek(0) # writing moved the cursor to the end of the file, reset
    plt.clf() # clear pyplot

    return send_file(img, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)

    <html>
  <head>
    <title>Graph</title>
  </head>
  <body>
    <h1>Graph</h1>
    <img
       src="{{ url_for('graph', nodes=nodes) }}"
       alt="Complete Graph with {{ nodes }} nodes"
       height="200"
    />
  </body>
</html>
"""