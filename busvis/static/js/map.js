// =====================================================
//Filename : map.js
//Author : Kania Azrina 
//Desc : Map initialization and interaction handler 
// =====================================================

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

L.mapbox.accessToken = 'pk.eyJ1Ijoia2VubnlhenJpbmEiLCJhIjoidUY3OFkxVSJ9.5wxiS6D6ByjU5fRegUmyBQ'; //kennyazrina's API access token for BusVis

//load busroute
var map = L.mapbox.map('map-canvas', '', { zoomControl: false })
    .setView([40.655230, -73.955872], mapboxZoomLevel)
    .addLayer(L.mapbox.tileLayer('kennyazrina.lpg413d8'));

new L.Control.Zoom({ position: 'topright' }).addTo(map);

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

var circleIcon = L.divIcon({
  // Specify a class name we can refer to in CSS.
  className: 'circle-icon',
  // Set marker width and height
  iconSize: [10, 10]
});


var bus_stops = omnivore.csv(bus_stop_file)
    .on('ready', function(e) {

        document.getElementById('searchBusButton').onclick = clickButton;

        this.eachLayer(function(marker) {


            if (search_value_list.indexOf(marker.toGeoJSON().properties.stop_name) == -1) { //not exist in array
                search_value_list.push(marker.toGeoJSON().properties.stop_name);
                bus_stop_name_list.push(marker.toGeoJSON().properties.stop_name);
            } 

            bus_stop_dict[marker.toGeoJSON().properties.stop_id] = marker.toGeoJSON().properties.stop_name;
            
            /** Cleaning the bus lines name, stores the name into array **/
            var linesLabel = "";
            var lines = cleanLineNames(marker.toGeoJSON().properties.bus_lines);
            for (i=0; i< lines.length ; i++){
                linesLabel = linesLabel + lines[i] + ", ";
            }
            linesLabel = linesLabel.substr(0,linesLabel.length-2);
        

            marker.setIcon(circleIcon);

            marker.bindPopup(
              '<h1 style="color:#000000;">'
              +marker.toGeoJSON().properties.stop_name 
              +'</h1><p class="light" style="color:#000000;">Bus Lines : '
              +linesLabel
              +'</p><p class="light" style="color:#000000;">Borough : '
              +marker.toGeoJSON().properties.BoroName
              +'</p><p class="light" style="color:#000000;">Zip Code : '
              +marker.toGeoJSON().properties.POSTAL
              +'</p><p class="light" style="color:#000000;">Census Block : '
              +marker.toGeoJSON().properties.CB2010
              +'</p><p class="light" style="color:#000000;">Census Tract : '
              +marker.toGeoJSON().properties.CT2010
              +'</p><p class="light" style="color:#000000;">School District: '
              +marker.toGeoJSON().properties.SchoolDist
            );
        });

        e.target.eachLayer(function(layer) {
            cluster_group_default.addLayer(layer);
            //TO-DO : DISABLE CLUSTER AT
        });
        //map.addLayer(clusterGroup);

    })
    //.addTo(map);

    map.addLayer(cluster_group_default);

//CLUSTER HANDLER
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
              +feature.properties.route_id
              +'</h1><p class="light" style="color:#000000;">Route  : '
              +feature.properties.route_name
              +'</p><p class="light" style="color:#000000;">Speed  : '
              +feature.properties.speed
              +'</p><p class="light" style="color:#000000;">ID  : '
              +feature.id
            );


            if (search_value_list.indexOf(feature.properties.route_id) == -1) { //not exist in array
                search_value_list.push(feature.properties.route_id);
                bus_line_id_list.push(feature.properties.route_id);
            }

            layer.on('click',function(){
                var route_id = feature.properties.route_id;
                var shape_id = 'B110025'; //TO-DO : get shape_id
                clickBusLine(shape_id,route_id);
            }); 
        }
        
    })

bus_line.setStyle(myStyle);
var colorScale = d3.scale.linear().domain(all_speed).range(colorbrewer.RdYlGn[11]);


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


bus_stops.on('mouseover', function(e) {
    e.layer.openPopup();
});
bus_stops.on('mouseout', function(e) {
    e.layer.closePopup();
});

bus_line.on('mouseover', function(e) {
    e.layer.openPopup();
});
bus_line.on('mouseout', function(e) {
    e.layer.closePopup();
});

function clickButton() {
    var search_value = document.getElementById("searchBus").value;
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
                $.getJSON($SCRIPT_ROOT + '/_get_waittimes', {
                    stop_id: stop_id
                }, function (data) {
                    // console.log("RP: inside bus_stops.on('click'", data);
                    $.each(data, function(k, v) {
                        // console.log("RP: k, v", k, v.maxtimes);
                        makeHistogram(v, k, "sec");
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
        var shape_id = 'B110025'; //TO-DO : get shape_id
        clickBusLine(shape_id,search_value);
    }

}

// ==========================New clickBusLine function==============
// Added ajax jquery to access redis via flask
// Contact : drp354@nyu.edu
// =================================================================

function clickBusLine (shape_id,route_id_input){

searchQuery = 'http://localhost:5000/_get_busspeed?shape_id='+shape_id;
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
                
                var route_name = bus_line_dict[route_id_input];

                d3.select("#bus_line_sidebar").select("h2").text(route_name);
                d3.select("#bus_line_sidebar").select("h4").text("Route ID : " + route_id_input)
                                                    .style({'color': 'white'});
                
                var station_list = data['list_stop_id'];
                var distance_list = data['list_stop_id'];
                var speed_list = [];
                var dist_list = [];
                var idx_start = 2;


                for (var i=1 ; i<station_list.length-1 ; i++){

                    var data_indexed = data[idx_start];
                    var stop_tmp = data_indexed["stop_id"];
                    var speed_tmp = data_indexed["speed"];
                    var dist_tmp = data_indexed["distance"]; 
                    var default_dist = data_indexed["distance_per_id"];
                    
                    if (stop_tmp == station_list[i]){
                         speed_list.push(speed_tmp);
                         dist_list.push(dist_tmp);
                     } else {

                         speed_list.push("null");
                         dist_list.push(default_dist[i]);
                    }
                    
                    idx_start = idx_start+1;
                }


                drawLineViz(station_list, speed_list,dist_list);
                $('#bus_line_sidebar').offcanvas('show');
                $('#bus_line_sidebar').offcanvas();          
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

bus_stops.on('click', function(e) {

    $('#bus_stop_sidebar').offcanvas('show');

    e.layer.openPopup();
    
    // remove previous histograms from sidebar
    d3.select("#busstop_histogram").selectAll("svg").remove();
    d3.select("#busstop_histogram").selectAll("h6").remove();

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
    $.getJSON($SCRIPT_ROOT + '/_get_waittimes', {
        stop_id: stop_id
    }, function (data) {
        // console.log("RP: inside bus_stops.on('click'", data);
        $.each(data, function(k, v) {
            // console.log("RP: k, v", k, v.maxtimes);
            makeHistograms(v, k, "sec");
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


$( document ).ready(function() {
    //$('#myNavmenu').offcanvas();
});

