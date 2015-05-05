L.mapbox.accessToken = 'pk.eyJ1Ijoia2VubnlhenJpbmEiLCJhIjoidUY3OFkxVSJ9.5wxiS6D6ByjU5fRegUmyBQ'; //kennyazrina's API access token for BusVis

//load busroute

var map = L.mapbox.map('map-canvas')
    .setView([40.725497, -73.844016], mapboxZoomLevel)
    .addLayer(L.mapbox.tileLayer('kennyazrina.lpg413d8'));

var bus_stops = omnivore.csv(file_bus_stop_descriptions)
    .on('ready', function(e) {
        // An example of customizing marker styles based on an attribute.
        // In this case, the data, a CSV file, has a column called 'state'
        // with values referring to states. Your data might have different
        // values, so adjust to fit.
        this.eachLayer(function(marker) {
            
            marker.setIcon(L.mapbox.marker.icon({
                    'marker-color': mapMarkerColor,
                    'marker-size': 'large',
                    'marker-symbol': 'bus'
                }));

            marker.bindPopup(
              '<h1 style="color:#000000;">'
              +marker.toGeoJSON().properties.stop_name 
              +'</h1><p class="light" style="color:#000000;">Bus Lines : '
              +marker.toGeoJSON().properties.bus_lines
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
    
    var stop_id = e.layer.feature.properties.stop_id;
    var stop_name = e.layer.feature.properties.stop_name;
        
    // remove previous histograms from sidebar
    d3.select("#busstop_histogram").select("svg").remove();

    // call server script to load JSON with wait times for this stop_id
    // draw histogram(s)
    $.getJSON($SCRIPT_ROOT + '/_get_waittimes', {
        stop_id: stop_id
    }, function (data) {
        // console.log("RP: inside bus_stops.on('click'", data);
        $.each(data, function(k, v) {
            // console.log("RP: k, v", k, v.maxtimes);
            makeHistogram(v, k);
        });
    });

    d3.select("#myNavmenu").select("h2").text(stop_name);
    d3.select("#myNavmenu").select("h4").text("Stop ID " + stop_id);
      
    $('#myNavmenu').offcanvas();

});

$( document ).ready(function() {
    //$('#myNavmenu').offcanvas();
});

