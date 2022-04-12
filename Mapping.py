import os
from telnetlib import GA
os.environ["PATH"] += os.pathsep + 'C:\\Program Files\\Graphviz\\bin'
import networkx as nx
from networkx.drawing.nx_agraph import graphviz_layout
from pyvis.network import Network
from itertools import count
from pylab import rcParams
import pandas as pd
import matplotlib.pyplot as plt

def plotMap(df,projectName):
    paths = df.loc[:,['URL','dept_1']].stack().groupby(level=0).agg(list).values.tolist()

    G = nx.DiGraph()

    for i,path in enumerate(paths):
        path[0] = 0
        path[1] = "{}".format(i+1)
        nx.add_path(G, path)

    colors = []
    colors.append('green')
    for i in range(len(G.nodes())-1):
        if df['complexity_score'][i]<3:
            colors.append('green')
        elif df['complexity_score'][i]<5:
            colors.append('yellow')
        elif df['complexity_score'][i]<7:
            colors.append('orange')
        else:
            colors.append('red')

    pos=graphviz_layout(G, prog='circo')
    nx.draw(G, pos=pos,
            node_color=colors, 
            node_size=1500,
            with_labels=True, 
            arrows=True)
    plt.savefig('static/images/'+ projectName +'.png')
    
