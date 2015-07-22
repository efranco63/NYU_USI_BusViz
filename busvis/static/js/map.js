// =====================================================
//Filename : map.js
//Author : Kania Azrina ka1531@nyu.edu
//Desc : Map initialization and interaction handler 
// =====================================================



// ====== VARIABLES INITIALIZATION ====== //

var search_value_list = [] //to be used in search box autocomplete, bus stop name and bus line id
var bus_stop_name_list = []
var bus_line_id_list = []
var bus_line_dict = {}
var bus_stop_dict = {}

var max_speed = 0; //mph
var min_speed = 999; //mph
var all_speed = [];


//CLUSTER GROUPS
var cluster_group_default = new L.MarkerClusterGroup({disableClusteringAtZoom:16});
var cluster_group_zipcode = new L.MarkerClusterGroup();
var cluster_group_borough = new L.MarkerClusterGroup();
var cluster_group_tract = new L.MarkerClusterGroup();
var cluster_group_school = new L.MarkerClusterGroup();
var cluster_group_block = new L.MarkerClusterGroup();

//FLAGS
var bus_stop_flag = true;
var bus_line_flag = true;
var cluster_group_default_flag = true;
var cluster_group_zipcode_flag = false;
var cluster_group_borough_flag = false;
var cluster_group_tract_flag = false;
var cluster_group_school_flag = false;
var cluster_group_block_flag = false;



// ====== FUNCTIONS ====== //

//MISC FUNCTIONS

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function cleanLineNames(busLines){
    //receive marker.toGeoJSON().properties.bus_lines
    //output string of bus names
    var lines = [];

    busLines = busLines.replace("[","");
    busLines = busLines.replace("]","");
    busLines = replaceAll("'","",busLines)
    busLines = replaceAll(" ","",busLines)
    lines = busLines.split(",");
            
    return lines;
}

//CLUSTER FUNCTIONS

function busClusterToggleClick() {
    // access properties using this keyword
    if ( cluster_group_default_flag == false ) {
        map.removeLayer(bus_stops);
        map.addLayer(cluster_group_default);
        cluster_group_default_flag = true; 
    } else if ( cluster_group_default_flag == true) {
        map.removeLayer(cluster_group_default);
        map.addLayer(bus_stops);
        cluster_group_default_flag = false; 
    }
}

function busStopToggleClick() {
    // access properties using this keyword
    if ( bus_stop_flag == false ) {
        map.addLayer(bus_stops);
        bus_stop_flag = true; 
    } else if ( bus_stop_flag == true) {
        map.removeLayer(cluster_group_default);
        map.removeLayer(bus_stops);
        bus_stop_flag = false; 
    }
}

function busLineToggleClick() {
    // access properties using this keyword
    if ( bus_line_flag == false ) {
        map.addLayer(bus_line);
        bus_line_flag = true; 
    } else if ( bus_line_flag == true) {
        map.removeLayer(bus_line);
        bus_line_flag = false; 
    }
}

// SEARCH FUNCTION

function clickButton() {
    var search_value = document.getElementById("searchBus").value;
    var start_date = document.getElementById("startDate").value;
    var lines = [];

    if (bus_stop_name_list.indexOf(search_value) != -1){
        bus_stops.eachLayer(function(marker) {
            if (marker.toGeoJSON().properties.stop_name == search_value) {
                marker.openPopup();
                
                $('#bus_stop_sidebar').offcanvas('show');
                
                d3.select("#busstop_histogram").selectAll("svg").remove();
                d3.select("#busstop_histogram").selectAll("h6").remove();

                var lng = marker.feature.geometry.coordinates[0];
                var lat = marker.feature.geometry.coordinates[1];
                lines = cleanLineNames(marker.feature.properties.bus_lines);
                var stop_id = marker.feature.properties.stop_id;

                map.setView([lat, lng], 19);

                // call server script to load JSON with wait times for this stop_id
                // draw histogram(s)
                var buslinesWithActualTimes = []

                $.getJSON($SCRIPT_ROOT + '/_get_waittimes', {
                    stop_id: stop_id
                }, function (data) {
                    $.each(data, function(k, v) {
                        makeHistograms(v, k, "sec", "#busstop_histogram");
                        buslinesWithActualTimes.push(k);
                    });
                });

                $.getJSON($SCRIPT_ROOT + '/_get_scheduled_waittimes', {
                    stop_id: stop_id
                }, function (data) {
                    $.each(data, function(k, v) {
                        // console.log("RP: k = " + k);
                        // console.log("RP: v = " + v);
                        if(buslinesWithActualTimes.indexOf(k) > -1) {
                            makeHistograms(v, k, "sec", "#busstop_histogram_sched");
                        }
                    });
                });

                //get bus route color from data/busroute_color.csv
                d3.select("#bus_stop_sidebar").select("h2").text(search_value);
                d3.select("#bus_stop_sidebar").select("h4").text("Stop ID : " + stop_id)
                                                    .style({'color': 'white'});
                  
                $('#bus_stop_sidebar').offcanvas();
                
                for (var i=0; i<lines.length ; i++){
                    drawBusLine(lines[i]);
                }

            } 
        })

    } else if (bus_line_id_list.indexOf(search_value) != -1){
        clickBusLine(search_value);
    }

}

// ==========================New clickBusLine function==============
// Added ajax jquery to access redis via flask
// Contact : drp354@nyu.edu
// =================================================================

function clickBusLine (shape_id){

searchQuery = '/_get_busspeed?shape_id='+shape_id;
//searchQuery = 'http://busvis.cloudapp.net/_get_busspeed?shape_id='+shape_id;
console.log(searchQuery);

$.ajax({
        url: searchQuery,
        type: 'GET',
        dataType: 'json',
        error:function(x,e){
            if(x.status === 0){
                alert('You are offline!!\n Please Check Your Network.');
            }
            else if(x.status==404){
                alert('Requested URL not found.');
            }
            else if(x.status==500){
                alert('Internal Server Error.');
            }
            else if(e=='parsererror'){
                alert('Error.\nParsing JSON Request failed.');
            }
            else if(e=='timeout'){
                alert('Request Time out.');
            }
            else {
                alert('Unknown Error.\n'+x.responseText);
            }
        },
        success: function(data){
                
                var route_id = data['route_id'];
                var route_name = data['route_name'];;

                d3.select("#bus_line_sidebar").select("h2").text(route_name);
                d3.select("#bus_line_sidebar").select("h4").text("Route ID : " + route_id)
                                                    .style({'color': 'white'});
                
                var station_list = data['list_stop_id'];
                var distance_list = data['distance_per_id'];
                var speed_list = [];
                var dist_list = [];
                var idx_start = 2;


                for (var i=1 ; i<station_list.length-1 ; i++){

                    var data_indexed = data[idx_start];

                    var stop_tmp = "";
                    var speed_tmp = 0; 
                    var dist_tmp = 0; 
                    
                    if (data_indexed != undefined){
                        speed_tmp = data_indexed["speed"];
                        dist_tmp = data_indexed["distance"];
                        speed_list.push(speed_tmp);
                        dist_list.push(dist_tmp);
                     } else {
                         speed_list.push("null");
                         dist_list.push(distance_list[i]);
                    }
                    
                    idx_start = idx_start+1;
                }


                drawLineViz(station_list, speed_list,dist_list);
                
                $('#bus_line_sidebar').offcanvas();  
                $('#bus_line_sidebar').offcanvas('show');        
        }
    });

}
// =================================================================


function drawBusLine(route_id){
    bus_line.eachLayer(function(marker) {
        if (marker.toGeoJSON().properties.route_id == route_id) {
            marker.addTo(map)
        }
    });
}



// ====== MAPS INITIALIZATION ====== //

L.mapbox.accessToken = 'pk.eyJ1Ijoia2VubnlhenJpbmEiLCJhIjoidUY3OFkxVSJ9.5wxiS6D6ByjU5fRegUmyBQ'; //kennyazrina's API access token for BusVis

//load busroute
var map = L.mapbox.map('map-canvas', '', { zoomControl: false })
    .setView([40.655230, -73.955872], mapboxZoomLevel)
    .addLayer(L.mapbox.tileLayer('kennyazrina.lpg413d8'));

new L.Control.Zoom({ position: 'topright' }).addTo(map);


// ====== BUS STOPS INITIALIZATION ====== //



var circleIcon = L.divIcon({
  // Specify a class name we can refer to in CSS.
  className: 'circle-icon',
  // Set marker width and height
  iconSize: [10, 10]
});

var bus_stops = L.geoJson(bus_stop_file,{
     onEachFeature: function (feature, layer) {

        document.getElementById('searchBusButton').onclick = clickButton;


            if (search_value_list.indexOf(feature.properties.stop_name) == -1) { //not exist in array
                search_value_list.push(feature.properties.stop_name);
                bus_stop_name_list.push(feature.properties.stop_name);
            } 

            bus_stop_dict[feature.properties.stop_id] = feature.properties.stop_name;
            
            /** Cleaning the bus lines name, stores the name into array **/
            var linesLabel = "";
            var lines = cleanLineNames(feature.properties.bus_lines);
            for (i=0; i< lines.length ; i++){
                linesLabel = linesLabel + lines[i] + ", ";
            }
            linesLabel = linesLabel.substr(0,linesLabel.length-2);
        

           layer.setIcon(circleIcon);

            layer.bindPopup(
              '<h1 style="color:#000000;">'
              +feature.properties.stop_name 
              +'</h1><p class="light" style="color:#000000;">Bus Lines : '
              +linesLabel
              +'</p><p class="light" style="color:#000000;">Borough : '
              +feature.properties.BoroName
              +'</p><p class="light" style="color:#000000;">Zip Code : '
              +feature.properties.POSTAL
              +'</p><p class="light" style="color:#000000;">Census Block : '
              +feature.properties.CB2010
              +'</p><p class="light" style="color:#000000;">Census Tract : '
              +feature.properties.CT2010
              +'</p><p class="light" style="color:#000000;">School District: '
              +feature.properties.SchoolDist
            );

    }
    //.addTo(map);
})

bus_stops.eachLayer(function(layer) {
    cluster_group_default.addLayer(layer);
});

    map.addLayer(cluster_group_default);

bus_stops.on('mouseover', function(e) {
    e.layer.openPopup();
});
bus_stops.on('mouseout', function(e) {
    e.layer.closePopup();
});

bus_stops.on('click', function(e) {

    $('#bus_stop_sidebar').offcanvas('show');

    e.layer.openPopup();
    
    // remove previous histograms from sidebar
    d3.select("#busstop_histogram").selectAll("svg").remove();
    d3.select("#busstop_histogram").selectAll("h6").remove();

    d3.select("#busstop_histogram_sched").selectAll("svg").remove();
    d3.select("#busstop_histogram_sched").selectAll("h6").remove();

    //map.setView([40.725497, -73.844016], mapboxZoomLevel)

    var stop_id = e.layer.feature.properties.stop_id;
    var stop_name = e.layer.feature.properties.stop_name;
    var lng = e.layer.feature.geometry.coordinates[0];
    var lat = e.layer.feature.geometry.coordinates[1];
    var lines = cleanLineNames(e.layer.feature.properties.bus_lines);
    map.setView([lat, lng], map.getZoom());
    //map.setView([lat, lng], 19);
        
    // call server script to load JSON with wait times for this stop_id
    // draw histogram(s)
    var buslinesWithActualTimes = []

    $.getJSON($SCRIPT_ROOT + '/_get_waittimes', {
        stop_id: stop_id
    }, function (data) {
        $.each(data, function(k, v) {
            makeHistograms(v, k, "sec", "#busstop_histogram");
            buslinesWithActualTimes.push(k);
        });
    });

    $.getJSON($SCRIPT_ROOT + '/_get_scheduled_waittimes', {
        stop_id: stop_id
    }, function (data) {
        $.each(data, function(k, v) {
            // console.log("RP: k = " + k);
            // console.log("RP: v = " + v);
            if(buslinesWithActualTimes.indexOf(k) > -1) {
                makeHistograms(v, k, "sec", "#busstop_histogram_sched");
            }
        });
    });

    //get bus route color from data/busroute_color.csv
    d3.select("#bus_stop_sidebar").select("h2").text(stop_name);
    d3.select("#bus_stop_sidebar").select("h4").text("Stop ID : " + stop_id)
                                        .style({'color': 'white'});
      
    $('#bus_stop_sidebar').offcanvas();

    for (var i=0; i<lines.length ; i++){
        drawBusLine(lines[i]);
    }

});



// ====== BUS LINES INITIALIZATION ====== //

var myStyle = {
            "weight": 2 ,
            "opacity": 0.5
        };

var bus_line = L.geoJson(bus_line_file, {
        onEachFeature: function (feature, layer) {

            //add to array
            bus_line_dict[feature.properties.route_id] = feature.properties.route_name;
            
            //find the max speed and min speed
            if (feature.properties.speed>max_speed){ max_speed = feature.properties.speed; }
            if (feature.properties.speed<min_speed){ min_speed = feature.properties.speed; }

            all_speed.push(feature.properties.speed); 



            layer.bindPopup(
              '<h1 style="color:#000000;">'
              +feature.properties.shape_id
              +'</h1><p class="light" style="color:#000000;">Speed  : '
              +feature.properties.speed.toFixed(2)
              +' mph</p>'
            );


            if (search_value_list.indexOf(feature.properties.shape_id) == -1) { //not exist in array
                search_value_list.push(feature.properties.shape_id);
                bus_line_id_list.push(feature.properties.shape_id);
            }

            layer.on('click',function(){
                var shape_id = feature.properties.shape_id; 
                clickBusLine(shape_id);
            }); 
        }
        
    })

bus_line.setStyle(myStyle);

var color_domain = [];
var color_domain_label = [];
var step = ((max_speed-min_speed)/10);
var stepOffset = min_speed;

color_domain.push(min_speed);
for (var i=0; i<4 ; i++){
    stepOffset = stepOffset+step;
    color_domain.push(stepOffset);
}

for (var i=0; i<5 ; i++){
    color_domain_label.push(color_domain[i].toFixed(2));
}

var colorScale = d3.scale.quantile().domain(all_speed).range(colorbrewer.RdYlGn[5]);

bus_line.setStyle(function(feature) {
    
    var speed_color = (feature.properties.speed)-min_speed;
    var line_color = colorScale(speed_color);

            if (line_color=="#000000"){
                return { opacity:0} 
            } else{
                return { color: line_color}
            }
            
        });

bus_line.addTo(map);


var legend = d3.select('#lineSpeedLegendBox')
  .append('ul')
    .attr('class', 'list-inline');

var keys = legend.selectAll('li.key')
    .data(colorScale.range());

keys.enter().append('li')
    .attr('class', 'key')
    .style('border-top-color', String)
    .text(function(d) {
        var r = colorScale.invertExtent(d);
        return r[0].toFixed(2);
    });

bus_line.on('mouseover', function(e) {
    e.layer.openPopup();
});
bus_line.on('mouseout', function(e) {
    e.layer.closePopup();
});
