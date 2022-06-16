var scores={};

function draw(){
  /*
  
 }C:\Users\DELL\Desktop\ViscoMap\viscomap-main\metu-emine-role-detection-api-ee564a450501\jsonDictionary.json
*/
/*
var fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8')),
	pageSegmenter = require('./page-segmenter'),
    Horseman = require('node-horseman');*/

//const scores= require("C:\\Users\\DELL\\Desktop\\ViscoMap\\viscomap-main\\metu-emine-role-detection-api-ee564a450501\\jsonDictionary.json");
/*var scores={};
fetch("C:\\Users\\DELL\\Desktop\\ViscoMap\\viscomap-main\\metu-emine-role-detection-api-ee564a450501\\jsonDictionary.json")
.then(mockResponses => {
   return mockResponses.json();
})
.then(scores=data);*/

//xobj.open('GET', 'C:/Users/DELL/Desktop/ViscoMap/viscomap-main/metu-emine-role-detection-api-ee564a450501/jsonDictionary.json', true); // Replace 'my_data' with the path to your file
/*  var scores={};
  init(scores);
  function loadJSON(callback) {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', 'C:/Users/DELL/Desktop/ViscoMap/viscomap-main/metu-emine-role-detection-api-ee564a450501/jsonDictionary.json', true); // Replace 'my_data' with the path to your file
      xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200"){
              // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
      }
      };
      
      xobj.send(null);
      //C:\Users\DELL\Desktop\ViscoMap\viscomap-main\static\script.js
  }
  function init(scores) {
    
    loadJSON(function(response) {
    // Parse JSON string into object
      scores = JSON.parse(response);
      console.log(JSON.parse(response));
    });
  }*/


        
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

      //usage:
      scores = readTextFile("static/ProjectFile.json", function(text){
        scores = JSON.parse(text);
        //console.log("PARSED TEXT",JSON.parse(text));
       // console.log("SCORES",scores);
        visualize();

      });
      function visualize(){
        console.log(scores);
        var j = -1,colour;
        const scoresArray=[];

        /*
        function scoring(){
            var k = 0;
            for(var key in tcores){
                if(k!=i){
                    k++;
                    continue;
                }
                else{
                    if(tcores[key] <= 3)
                        colour = "green";
                    else if(3 < tcores[key]<= 7)
                        colour = "yellow";
                    else
                        colour = "red";
                    break;
                }
            }

            return JSON.stringify(tcores[key]);
        }
        */
        function colorize(score){
            if(score <= 3)
              return "green"
            else if(score <= 7)
              return "yellow"
            else
              return "red"
        }

        var nodes = new vis.DataSet();

        for(const key in scores){
            if(j<0){
              //  console.log("first key",scores[key].score);
                nodes.add([
                    {id: ++j, label: JSON.stringify(scores[key].score), title: key, color: colorize(scores[key].score)},
                ])
            }
            for(const nestedKey in scores[key]){
                if(nestedKey === "score")
                    continue;
                //console.log("Depth 1 Scores: ", scores[key][nestedKey].score);
                if(scores[key][nestedKey].score !=null){
                  nodes.add([
                      {id: ++j, label: JSON.stringify(scores[key][nestedKey].score), title: nestedKey ,color: colorize(scores[key][nestedKey].score)},
                  ]);
                }
                else{
                  nodes.add([
                      {id: ++j, label: scores[key][nestedKey], title: nestedKey ,color: colorize(scores[key][nestedKey])},
                  ])
                }
                for(const nestedKey2 in scores[key][nestedKey]){
                    console.log("Nestedkey2:",nestedKey2);
                    /*if(nestedKey2 != "score" && -1 < parseInt(nestedKey2) < 200) 
                      break;*/
                    //console.log("J value & value inside nestedkey: ",j, nestedKey);
                    if(nestedKey2 === "score")
                        continue;
                    nodes.add([
                        {id: ++j, label: JSON.stringify(scores[key][nestedKey][nestedKey2]),title: nestedKey2 ,color: colorize(scores[key][nestedKey][nestedKey2])},
                    ]);

                  // console.log("J value & value inside nestedkey: ",j, nestedKey2);
                }
              //  console.log("nestedKey: ",nestedKey);
            }
            //console.log("other keys: ",key);
        }


        /*
        for (const key in scores) {
            if (typeof scores[key] === 'object') {
              //console.log(scores[key][nestedKey].score);

              for (const nestedKey in scores[key]) {
                console.log(scores[key][nestedKey].score);
                nodes.add([
                    {id: ++j, label: JSON.stringify(scores[key][nestedKey].score), color: colour},
                ]);
              }
            }
            else {
                //console.log(scores[key][nestedKey].score);
                nodes.add([
                    {id: ++j, label: JSON.stringify(scores[key].score), color: colour},
                ]);
            }
        }

        /*
        for(var key in scores){

            if(scores[key].score <= 3)
                colour = "green";
            else if(3 < scores[key].score<= 7)
                colour = "yellow";
            else
                colour = "red";
            console.log(JSON.stringify(scores[key].score));
            nodes.add([
              {id: ++j, label: JSON.stringify(scores[key].score), color: colour},
            ]);
            console.log(JSON.stringify(scores[key].score));
        }*/


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