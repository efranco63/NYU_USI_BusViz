
/******************************************************
  CONFIGURATION
******************************************************/

var env = "prod";
//var env = "dev";


/******************************************************
  PATHS TO ALL THE DATA
******************************************************/

var file_bus_stop_descriptions = "/static/busroute/bus_stop_descriptions.csv";


/******************************************************
  MAP
******************************************************/

// for development
var mapboxZoomLevel = (env === "dev") ? 17 :13;

/* Colors */
var mediumGreen = "#4569A8";
var mapMarkerColor = mediumGreen;


/******************************************************
  FRONTEND stuff 
******************************************************/

//	define histogram
var histoWidth = 260;
var histoHeight = 150;
var histoAreaPadding = 40;


// consistent text for all our labels for frontend
var labelStopHistoX = "TODO";
var labelStopHistoY = "Waiting time in seconds";




