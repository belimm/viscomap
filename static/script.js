var scores={};

function draw(){
 
      function readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
        
      }

      
      scores = readTextFile("static/ProjectFile.json", function(text){
        scores = JSON.parse(text);
        visualize();
      });

      function visualize(){
        console.log(scores);
        var j = -1,colour;
        const scoresArray=[];

      
        function colorize(score){
            if(score <= 3)
              return "#98FB98"
            else if(score <= 7)
              return "yellow"
            else
              return "red"
        }

        var nodes = new vis.DataSet();
        var depthh;
        depthh = scores["Depth"]
        for(const key in scores){
            if(j<0 && key != "Depth"){
              //  console.log("first key",scores[key].score);
                nodes.add([
                  {id: ++j, label: parseFloat(scores[key].score).toFixed(2), title: key, color: colorize(scores[key].score)},
                ])
            }
            for(const nestedKey in scores[key]){
                if(nestedKey === "score")
                    continue;
                //console.log("Depth 1 Scores: ", scores[key][nestedKey].score);
                if(scores[key][nestedKey].score !=null){
                  nodes.add([
                    {id: ++j, label: parseFloat(scores[key][nestedKey].score).toFixed(2), title: nestedKey ,color: colorize(scores[key][nestedKey].score)},
                  ]);
                }
                else{
                  nodes.add([
                    {id: ++j, label: parseFloat(scores[key][nestedKey]).toFixed(2), title: nestedKey ,color: colorize(scores[key][nestedKey])},
                  ])
                }
                for(const nestedKey2 in scores[key][nestedKey]){
                    if(depthh==1)
                      break;
                    console.log("Nestedkey2:",nestedKey2);
                    /*if(nestedKey2 != "score" && -1 < parseInt(nestedKey2) < 200) 
                      break;*/
                    //console.log("J value & value inside nestedkey: ",j, nestedKey);
                    if(nestedKey2 === "score")
                        continue;
                    nodes.add([
                      {id: ++j, label: parseFloat(scores[key][nestedKey][nestedKey2]).toFixed(2),title: nestedKey2 ,color: colorize(scores[key][nestedKey][nestedKey2])},
                    ]);

                  // console.log("J value & value inside nestedkey: ",j, nestedKey2);
                }
              //  console.log("nestedKey: ",nestedKey);
            }
            //console.log("other keys: ",key);
        }

        var edges = [];


        var depth1 = [];
        var depth2 = [];
        tempEdges = {};
        var depth1Count = -1;
        var depth2Count = 0;
        var depthCount = 1;
        var edges = [];

        for(const key in scores){
            for(const nestedKey in scores[key]){
                if(nestedKey === "score")
                    continue;
                depth1Count++;
                depth1[depth1Count] = depthCount;
                //console.log("After continue, depthcount: ",depthCount,nestedKey);
                tempEdges={from: 0, to: depthCount};
                //console.log("from 0 to: ", depthCount);
                edges.push(tempEdges);
                depthCount++;
                for(const nestedKey2 in scores[key][nestedKey]){
                    if(depthh==1)
                      break;
                    /*if(nestedKey2 != "score" && -1 < parseInt(nestedKey2) < 200)
                      break;*/
                    if(nestedKey2 === "score")
                        continue;
                    depth2[depth2Count] = depthCount;
                    tempEdges={from: depth1[depth1Count], to: depthCount};
                    console.log("from", depth1[depth1Count], "to:", depthCount);
                    //console.log(depthCount);
                    edges.push(tempEdges);
                    depth2Count++;
                    depthCount++;
                }
            }
        }


        // create a network
        var container = document.getElementById("mynetwork");
        var data = {
          nodes: nodes,
          edges: edges,
        };
        var options = {
          layout: {
            hierarchical: {
              direction: "UD",
              sortMethod: "directed",
            },
          },

        };
        network = new vis.Network(container, data, options);
        network.on("doubleClick", function (params) {
          if (params.nodes.length === 1) {
            var node = nodes.get(params.nodes[0]);
            if(node.title != null) {
              window.open(node.title, '_blank');
            }
           }
        });
        // periodically change the layout
        let i = 0;
        setInterval(() => {
          var leaves = data.nodes.get().filter((node) =>
            network
              .getConnectedEdges(node.id)
              .map((edgeId) => data.edges.get(edgeId))
              .every((edge) => edge.to === node.id)
          );
          var leaf = leaves[i++ % leaves.length];

          var edgeIds = network.getConnectedEdges(leaf.id);
          var edge = data.edges.get(edgeIds[i++ % edgeIds.length]);
          var oldParent = data.nodes.get(edge.from);

          while(
            (i % data.nodes.length) + 1 === leaf.id ||
            (i % data.nodes.length) + 1 === oldParent.id
          ) {
            ++i;
          }
          var newParent = data.nodes.get((i++ % data.nodes.length) + 1);

          data.edges.update({
            id: edge.id,
            from: newParent.id,
          });

          console.info(
            `Node ${leaf.id} was reconnected from it's former parent node ${oldParent.id} to node ${newParent.id}.`
          );
        }, 1000);
      
    
      }
  }

window.addEventListener("load", () => {
  draw();
});