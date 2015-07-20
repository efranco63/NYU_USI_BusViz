
/******************************************************
  CONFIGURATION
******************************************************/

//var env = "prod";
var env = "dev";


/******************************************************
  PATHS TO ALL THE DATA
******************************************************/

var bus_stop_file = (env === "dev") ? "/static/busroute/bus_stop_sample.csv" : "/static/busroute/bus_stop_descriptions.csv";
var file_active_bus = "/static/dummy/active_bus_graph.csv";
var bus_line_file = (env === "dev") ? bus_route_brooklyn : bus_line_all;


/******************************************************
  MAP
******************************************************/

// for development
//var mapboxZoomLevel = (env === "dev") ? 17 :11;
var mapboxZoomLevel = 12 ;

/* Colors */
var mediumGreen = "#4569A8";
var mapMarkerColor = mediumGreen;


/******************************************************
  FRONTEND stuff 
******************************************************/

//	define histogram
var histoWidth = 360;
var histoHeight = 150;
var histoAreaPadding = 40;


// consistent text for all our labels for frontend
var labelStopHistoX = "TODO";
var labelStopHistoY = "Waiting time in minutes";




