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

bus_stops.on('mouseover', function(e) {
    e.layer.openPopup();
});
bus_stops.on('mouseout', function(e) {
    e.layer.closePopup();
});

bus_stops.on('click', function(e) {

    map.setView([40.725497, -73.844016], mapboxZoomLevel)

    var stop_id = e.layer.feature.properties.stop_id;
    var stop_name = e.layer.feature.properties.stop_name;
    var bus_lines = e.layer.feature.properties.bus_lines;
    prepareHistogramData(stop_id);  //we don't need to prepare and read a file bec we already have the json as a parameter
    //makeHistogram(waittimes_json);
    var lng = e.layer.feature.geometry.coordinates[0];
    var lat = e.layer.feature.geometry.coordinates[1];
    
    //map.setView([lat, lng], 16)


    linesLabel = cleanLineNames(bus_lines);

    d3.select("#myNavmenu").select("h2").text(stop_id);
    d3.select("#myNavmenu").select("h4").text(stop_name);

    d3.select("#myNavmenu").select("#routes").text(linesLabel);

    // TODO: this does not work bec. this is a string!!!
    //var bus_linesArr = JSON.parse(bus_lines);
    //console.log("RP: bus stop on click:", JSON.parse(bus_lines));
    // d3.select("#routes")
    //     .selectAll("p")
    //         .data(bus_lines)
    //         .enter()
    //         .append("p")
    //         .text(function(d) {
    //             return d;           
    //         });
    
    $('#myNavmenu').offcanvas();

});

$( document ).ready(function() {
    //$('#myNavmenu').offcanvas();
});

