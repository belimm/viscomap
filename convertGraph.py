import json

def convert():
    graph = {}
    tempNodes = {"id": "", "group": 0}
    tempLinks = {"source": "", "target": "", "value": 0}
    convertedGraph = {}
    convertedGraph['nodes'] = []
    convertedGraph['links'] = []
    with open('static/ProjectFile.json','r') as f:
        graph = json.load(f)
    print(graph)
    print(graph["Depth"])
    if(graph['Depth'] == 1):
        for key in list(graph.keys()):
            if (key != "score") and (key != "Depth"):
                print(key)
                tempNodes['id'] = key
                tempNodes['group'] = 0
                convertedGraph['nodes'].append(tempNodes.copy())
                tempNodes = {"id": "", "group": 0}
                for key2 in list(graph[key].keys()):
                    tempNodes['id'] = key2
                    tempNodes['group'] = graph[key][key2]
                    print(graph[key][key2])
                    convertedGraph['nodes'].append(tempNodes.copy())
                    tempLinks['source'] = key
                    tempLinks['target'] = key2
                    if(graph[key][key2] == 0):
                        tempLinks['value'] = 1
                    else:
                        tempLinks['value'] = graph[key][key2]
                    convertedGraph['links'].append(tempLinks.copy())
                    tempNodes = {"id": "", "group": 0}
                    tempLinks = {"source": "", "target": "", "value": 0}  
        with open('static/convertedGraph.json','w') as f:
            json.dump(convertedGraph, f, indent=4)
    elif(graph['Depth'] == 2):
        for key in list(graph.keys()):
            if (key != "score") and (key != "Depth"):
                print(key)
                tempNodes['id'] = key
                tempNodes['group'] = 0
                convertedGraph['nodes'].append(tempNodes.copy())
                tempNodes = {"id": "", "group": 0}
                for key2 in list(graph[key].keys()):
                    if key2 != "score":
                        print(key2)
                        tempNodes['id'] = key2
                        tempNodes['group'] = 0
                        convertedGraph['nodes'].append(tempNodes.copy())
                        tempLinks['source'] = key
                        tempLinks['target'] = key2
                        tempLinks['value'] = 1
                        convertedGraph['links'].append(tempLinks.copy())
                        tempNodes = {"id": "", "group": 0}
                        tempLinks = {"source": "", "target": "", "value": 0}  
                        for key3 in list(graph[key][key2].keys()):
                            if key3 != "score":
                                print(key3)
                                tempNodes['id'] = key3
                                tempNodes['group'] = graph[key][key2][key3]
                                convertedGraph['nodes'].append(tempNodes.copy())
                                tempLinks['source'] = key2
                                tempLinks['target'] = key3
                                if graph[key][key2][key3] == 0:
                                    tempLinks['value'] = 1
                                else:
                                    tempLinks['value'] = graph[key][key2][key3]
                                convertedGraph['links'].append(tempLinks.copy())
                                tempNodes = {"id": "", "group": 0}
                                tempLinks = {"source": "", "target": "", "value": 0}  
        with open('static/convertedGraph.json','w') as f:
            json.dump(convertedGraph, f, indent=4)
        




