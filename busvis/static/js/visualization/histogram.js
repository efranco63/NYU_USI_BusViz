
/******************************************************
  VISUALIZATIONS Histogram
******************************************************/


function makeHistogram(dataset, title) {
  if (title === undefined) { title = ""; } 

  var values = dataset.maxtimes

  // A formatter for counts.
  var formatCount = d3.format(",.0f");

  var margin = {top: 10, right: 10, bottom: histoAreaPadding, left: 10},
      width = histoWidth - margin.left - margin.right,
      height = histoHeight - margin.top - margin.bottom;


  var minVal = Math.min.apply(null,values);
  var maxVal = Math.max.apply(null,values);

  var x = d3.scale.linear()
      .domain([minVal, maxVal])
      .range([0, width]);

  // Generate a histogram using twenty uniformly-spaced bins.
  var data = d3.layout.histogram()
      .bins(x.ticks(5))
      (values);

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var locationDiv = d3.select("#busstop_histogram");

  var bus_id = title.split("_")[1];

  if(title != "") {
    locationDiv.append("h6").text(title)
                            .style({'color':colorMap[bus_id]});
  }

  var svg = locationDiv.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("data-min", minVal)
      .attr("data-max", maxVal)
      .attr("data-height",height)
      .attr("data-width",width)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = svg.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(data[0].dx + minVal) - 1 )
      .attr("height", function(d) { return height - y(d.y); })
      .style({'fill':colorMap[bus_id],'opacity':0.5});

  // bar.append("text")
  //     .attr("dy", ".75em")
  //     .attr("y", 6)
  //     .attr("x", x(data[0].dx + minVal) / 2)
  //     .attr("text-anchor", "middle")
  //     .text(function(d) { return formatCount(d.y); });

  var ax = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("y", 30)
      .attr("font-size", 16)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .attr("transform", function(d) { return "translate(" + width/2 + "," +0+")"; })
      // changed label to reflect filtering
      .text(labelStopHistoY);

  svg.append("g").attr("class","vert_line");
}
