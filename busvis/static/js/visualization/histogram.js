
/******************************************************
  VISUALIZATIONS Histogram
******************************************************/

function makeHistograms(dataset, title, timeunit) {
  if (title === undefined) { title = ""; }
  if (timeunit === undefined) { timeunit = "min"; } 

  // console.log("RP: inside makeHistograms, dataset:", dataset);

  // OLD: var values = dataset.maxtimes
  // NEW: no max/mintimes any more -> select values per time bin: 0, 1, 2
  var values = dataset["0"];

  $.each(dataset, function(key, value) {
    // console.log("RP: " + key + ": " + value );
    // title = title + " Timeslot " + key;
    if(key == "0") {
      title = title + " 00:00-07:00";
    } else if(key == "1") {
      title = title + " 07:00-19:00";
    } else {
      title = title + " 19:00-24:00";
    }
    drawSingleHistogram(value, title, timeunit);
    title = "";
  });

}


function drawSingleHistogram(values, title, timeunit) {

  console.log("RP: inside drawSingleHistogram, values:", values);

  // in case values are in seconds tranform to minutes
  if (timeunit === "sec") {
    newValues = [];
    valueInMinutes = 0;
    for (var i=0; i < values.length; i++) {
      valueInMinutes = values[i]/60;
      newValues.push(valueInMinutes);
      // console.log("RP: inside makeHistogram, newValues:", newValues);
    }
    values = newValues;
  }

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
      .bins(x.ticks(10))
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

  bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", x(data[0].dx + minVal) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { 
        if(d.y > 30) {
          return formatCount(d.y); 
        } else {
          return "";
        }
      });

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
