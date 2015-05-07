function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function cleanLineNames(busLines){
    //receive marker.toGeoJSON().properties.bus_lines
    //output string of bus names
    var lines = [];
    var linesLabel = "";

    busLines = busLines.replace("[","");
    busLines = busLines.replace("]","");
    busLines = replaceAll("'","",busLines)
    busLines = replaceAll(" ","",busLines)
    lines = busLines.split(",");
            
    for (i=0; i< lines.length ; i++){
        linesLabel = linesLabel + lines[i] + ", ";
    }
    linesLabel = linesLabel.substr(0,linesLabel.length-2);

    return linesLabel;
}

L.mapbox.accessToken = 'pk.eyJ1Ijoia2VubnlhenJpbmEiLCJhIjoidUY3OFkxVSJ9.5wxiS6D6ByjU5fRegUmyBQ'; //kennyazrina's API access token for BusVis

//load busroute

var map = L.mapbox.map('map-canvas')
    .setView([40.725497, -73.844016], mapboxZoomLevel)
    .addLayer(L.mapbox.tileLayer('kennyazrina.lpg413d8'));

var bus_stops = omnivore.csv(file_bus_stop_descriptions)
    .on('ready', function(e) {

        this.eachLayer(function(marker) {

            /** Cleaning the bus lines name, stores the name into array **/
            linesLabel = cleanLineNames(marker.toGeoJSON().properties.bus_lines);
        

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
busLines.addTo(map);


bus_stops.on('mouseover', function(e) {
    e.layer.openPopup();
});
bus_stops.on('mouseout', function(e) {
    e.layer.closePopup();
});

bus_stops.on('click', function(e) {

    $('#myNavmenu').offcanvas('show');
    
    // remove previous histograms from sidebar
    d3.select("#busstop_histogram").selectAll("svg").remove();
    d3.select("#busstop_histogram").selectAll("h6").remove();

    //map.setView([40.725497, -73.844016], mapboxZoomLevel)

    var stop_id = e.layer.feature.properties.stop_id;
    var stop_name = e.layer.feature.properties.stop_name;
    var lng = e.layer.feature.geometry.coordinates[0];
    var lat = e.layer.feature.geometry.coordinates[1];
    map.setView([lat, lng], map.getZoom());
        
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

});

$( document ).ready(function() {
    //$('#myNavmenu').offcanvas();
});

