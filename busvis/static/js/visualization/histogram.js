
/******************************************************
  VISUALIZATIONS; Histogram
******************************************************/

function prepareHistogramData(stop_id) {
  console.log("RP: inside prepareHistogramData for stop id ", stop_id);

  //d3.csv()

}


function makeHistogram(dataset) {

  var values = dataset;

  // A formatter for counts.
  var formatCount = d3.format(",.0f");

  var margin = {top: 10, right: histoAreaPadding, bottom: histoAreaPadding, left: histoAreaPadding},
      width = histoWidth - margin.left - margin.right,
      height = histoHeight - margin.top - margin.bottom;


  var minVal = Math.min.apply(null,values);
  var maxVal = Math.max.apply(null,values);

  var x = d3.scale.linear()
      .domain([minVal, maxVal])
      .range([0, width]);

  // Generate a histogram using twenty uniformly-spaced bins.
  var data = d3.layout.histogram()
      .bins(x.ticks(20))
      (values);

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var locationDiv = d3.select("#histogram");

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
      .attr("height", function(d) { return height - y(d.y); });

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
      .text(labelWeatherNormEUIShort);

  
  svg.append("g").attr("class","vert_line");
}



function drawLine(xVal) {

  // Select the svg element containing the histogram
  var svg = d3.select("#histogram").select("svg");

  // Generate a linear map
  var x = d3.scale.linear()
      .domain([svg.attr("data-min"), svg.attr("data-max")])
      .range([0, svg.attr("data-width")]);

  // Get pointers to the line and text elements
  var line = svg.select("g.vert_line").selectAll("line");
  var lineText = svg.select("g.vert_line").selectAll("text");
  var yOffset = 100;

  // If the line is already displayed
  if(line[0].length > 0) {
    line.attr("x1",x(xVal))
      .attr("x2",x(xVal))

    lineText.attr("x", x(xVal))
      .text(xVal);
  }
  // Line is not yet displayed
  else {
    line.data(xVal)
      .enter()
      .append("line")
      .attr("x1",x(xVal))
      .attr("y1",yOffset)
      .attr("x2",x(xVal))
      .attr("y2",svg.attr("data-height"));

    lineText.data(xVal)
      .enter()
      .append("text")
      .attr("dy", ".75em")
      .attr("y", yOffset-12)
      .attr("x", x(xVal))
      .attr("text-anchor", "middle")
      .text(xVal);
  }

}
