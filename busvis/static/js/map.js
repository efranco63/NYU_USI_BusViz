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
            //"color": "#EE352E",
            "weight": 2 ,
            "opacity": 0.5
        };


        /*L.geoJson(buses_manhattan, {
            style: myStyle
        }).addTo(map*/

var bus_line = L.geoJson(bus_line_file, {
        onEachFeature: function (feature, layer) {
            
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
                clickBusLine(route_id);
            }); 
        }
        
    })

bus_line.setStyle(myStyle);


bus_line.setStyle(function(feature) {
    var speed_color = (feature.properties.speed)-min_speed;


            var colorScale = d3.scale.linear().domain(all_speed).range(colorbrewer.RdYlGn[11]);
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
        clickBusLine(search_value);
    }

}

// ==========================Old clickBusLine function==============
// function clickBusLine (route_id_input){

//     bus_line.eachLayer(function(marker) {
//         console.log("START: " + Date.now());

//         if (marker.toGeoJSON().properties.route_id == route_id_input) {

//                 console.log("END: " + Date.now());
//                 $('#bus_line_sidebar').offcanvas('show');

//                 marker.openPopup();

//                 var route_id = marker.toGeoJSON().properties.route_id;
//                 var route_name = marker.toGeoJSON().properties.route_name;

//                 //get bus route color from data/busroute_color.csv
//                 d3.select("#bus_line_sidebar").select("h2").text(route_name);
//                 d3.select("#bus_line_sidebar").select("h4").text("Route ID : " + route_id)
//                                                     .style({'color': 'white'});

//                 //drawLineViz(route_id);
                  
//                 $('#bus_line_sidebar').offcanvas();

//         }
//     });

// }
// ===============================================================



// ==========================New clickBusLine function==============
// Added ajax jquery to access redis via flask
// Contact : drp354@nyu.edu
// =================================================================
function clickBusLine (route_id_input){

searchQuery = 'http://localhost:5000/_get_busspeed?route_id='+route_id_input;
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
                alert('Internel Server Error.');
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

                var route_name = data['features'][0]['properties']['route_name'];
                var route_id = data['features'][0]['properties']['route_id'];

                $('#bus_line_sidebar').offcanvas('show');
                console.log('data = ""');
                console.log(data);
                d3.select("#bus_line_sidebar").select("h2").text(route_name);
                d3.select("#bus_line_sidebar").select("h4").text("Route ID : " + route_id)
                                                    .style({'color': 'white'});
                drawLineViz(route_id);
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

