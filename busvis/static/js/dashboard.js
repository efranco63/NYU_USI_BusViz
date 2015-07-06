/*ACTIVE BUSES SCRIPT*/

// Set the dimensions of the canvas / graph
var margin = {top: 10, right: 10, bottom: 35, left: 35},
    width = parseInt(d3.select('#active-bus-graph').style('width'), 10) - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

// Parse the date / time
var parseTime = d3.time.format("%H:%M").parse,
    bisectTime = d3.bisector(function(d) { return d.time; }).left;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.count); });
    
// Adds the svg canvas
var svg = d3.select("#active-bus-graph")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv(file_active_bus, function(error, data) {
    data.forEach(function(d) {
        d.time = parseTime(d.time);
        d.count = +d.count;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.time; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);



    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Add the valueline path.
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

      focus.append("circle")
          .attr("r", 4.5);

      focus.append("text")
          .attr("x", 9)
          .attr("dy", ".35em")
          .style("fill","#888888");

      svg.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove)
          .on("click",focusClick);

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectTime(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.time > d1.time - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.time) + "," + y(d.count) + ")");
        focus.select("text").text(d.count);
      }

      function focusClick(){
         var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectTime(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.time > d1.time - x0 ? d1 : d0;
            alert(d.time);

      }

});