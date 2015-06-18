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
    .setView([40.725497, -73.844016], mapboxZoomLevel)
    .addLayer(L.mapbox.tileLayer('kennyazrina.lpg413d8'));

new L.Control.Zoom({ position: 'topright' }).addTo(map);

var bus_stops_id = [] //to be used in search box autocomplete
var bus_stops_name = [] //to be used in search box autocomplete

var bus_stops = omnivore.csv(file_bus_stop_descriptions)
    .on('ready', function(e) {

        document.getElementById('searchBusButton').onclick = clickButton;

        this.eachLayer(function(marker) {
            if (bus_stops_id.indexOf(marker.toGeoJSON().properties.stop_id) == -1) { //not exist in array
                bus_stops_id.push(marker.toGeoJSON().properties.stop_id);
                bus_stops_name.push(marker.toGeoJSON().properties.stop_name);
            } 
            
            /** Cleaning the bus lines name, stores the name into array **/
            var linesLabel = "";
            var lines = cleanLineNames(marker.toGeoJSON().properties.bus_lines);
            for (i=0; i< lines.length ; i++){
                linesLabel = linesLabel + lines[i] + ", ";
            }
            linesLabel = linesLabel.substr(0,linesLabel.length-2);
        

            marker.setIcon(L.mapbox.marker.icon({
                    'marker-color': mapMarkerColor,
                    'marker-size': 'large',
                    'marker-symbol': 'bus'
                }));

            marker.bindPopup(
              '<h1 style="color:#000000;">'
              +marker.toGeoJSON().properties.stop_name 
              +'</h1><p class="light" style="color:#000000;">Bus Lines : '
              +linesLabel
              +'</p>'
            );
        });

        var clusterGroup = new L.MarkerClusterGroup();
        e.target.eachLayer(function(layer) {
            clusterGroup.addLayer(layer);
        });
        map.addLayer(clusterGroup);

    })
    //.addTo(map);

var myStyle = {
            //"color": "#EE352E",
            "weight": 2,
            "opacity": 0.5
        };

        /*L.geoJson(buses_manhattan, {
            style: myStyle
        }).addTo(map*/

var busLines = L.geoJson(buses_all, {
        style: function(feature) {
        return {color: feature.properties.route_color};
    }
})

busLines.setStyle(myStyle);
//busLines.addTo(map);


bus_stops.on('mouseover', function(e) {
    e.layer.openPopup();
});
bus_stops.on('mouseout', function(e) {
    e.layer.closePopup();
});

function clickButton() {
    var stop_name = document.getElementById("searchBus").value;
    var lines = [];

    bus_stops.eachLayer(function(marker) {
        if (marker.toGeoJSON().properties.stop_name == stop_name) {
            marker.openPopup();
            
            $('#myNavmenu').offcanvas('show');
            
            d3.select("#busstop_histogram").selectAll("svg").remove();
            d3.select("#busstop_histogram").selectAll("h6").remove();

            var lng = marker.feature.geometry.coordinates[0]+0.006;
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
            d3.select("#myNavmenu").select("h2").text(stop_name);
            d3.select("#myNavmenu").select("h4").text("Stop ID : " + stop_id)
                                                .style({'color': 'white'});
              
            $('#myNavmenu').offcanvas();

        }
    });

    for (var i=0; i<lines.length ; i++){
        drawBusLine(lines[i]);
    }

}

function drawBusLine(route_id){
    busLines.eachLayer(function(marker) {
        if (marker.toGeoJSON().properties.route_id == route_id) {
            marker.addTo(map)
        }
    });
}

bus_stops.on('click', function(e) {

    $('#myNavmenu').offcanvas('show');

    e.layer.openPopup();
    
    // remove previous histograms from sidebar
    d3.select("#busstop_histogram").selectAll("svg").remove();
    d3.select("#busstop_histogram").selectAll("h6").remove();

    //map.setView([40.725497, -73.844016], mapboxZoomLevel)

    var stop_id = e.layer.feature.properties.stop_id;
    var stop_name = e.layer.feature.properties.stop_name;
    var lng = e.layer.feature.geometry.coordinates[0]+0.006;
    var lat = e.layer.feature.geometry.coordinates[1];
    var lines = cleanLineNames(e.layer.feature.properties.bus_lines);
    //map.setView([lat, lng], map.getZoom());
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
    d3.select("#myNavmenu").select("h2").text(stop_name);
    d3.select("#myNavmenu").select("h4").text("Stop ID : " + stop_id)
                                        .style({'color': 'white'});
      
    $('#myNavmenu').offcanvas();

    for (var i=0; i<lines.length ; i++){
        drawBusLine(lines[i]);
    }

});

$( document ).ready(function() {
    //$('#myNavmenu').offcanvas();
});

