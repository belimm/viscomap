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

  
  readTextFile("static/convertedGraph.json", function(text){
    var scores = JSON.parse(text);
    graphWrite(scores);
  });

  function graphWrite(graph){
    console.log(graph);


    var mapOptions = {
      width: 720,
      height: 480,
      nodeRadius: 20,
      nodeStroke: 'black',
      nodeStrokeWidth: 2,
      getColor: function(value) {
        if(value <= 3)
          return "#98FB98";
        if(value <= 7)
          return "yellow";
        else
          return "red";
        //return (group == 1) ? '#34495e' : '#16a085'; 
      }
    };

    // initialize svg
    var svg = d3.select('.contain')
      .append('svg')
      .attr('width', mapOptions.width)
      .attr('height', mapOptions.height);

    // provide collide force to keep nodes from overlapping
    var collide = d3.forceCollide(mapOptions.nodeRadius*1.5);

    // force simulation
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(mapOptions.width / 2, mapOptions.height / 2))
        .force("collide", collide);

    // add links
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
          .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
          .attr("stroke", 'black');
      
    // add nodes
    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
        .attr('class', 'node')
        .attr('stroke', mapOptions.nodeStroke)
        .attr('stroke-width', mapOptions.nodeStrokeWidth)
        .attr("r", mapOptions.nodeRadius)
        .attr("fill", function(d) { return mapOptions.getColor(d.group); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
      
    // add node labels
    var texts = svg.selectAll('text.node-label')
      .data(graph.nodes)
      .enter().append('text')
      .attr('class', 'node-label')
      .attr('fill', 'black')
      .attr('dy', '0.35em')
      .text(function(d) { return d.group; });

    // add tick function
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    // add link forces
    simulation.force("link")
        .links(graph.links);



    function ticked() {

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

      texts.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          })
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function mouseover() {
      d3.select(this).select("circle").transition()
          .duration(750)
          .attr("r", 16);
    }

    function mouseout() {
      d3.select(this).select("circle").transition()
          .duration(750)
          .attr("r", 8);
    }
  }

  
}
window.addEventListener("load", () => {
  draw();
});