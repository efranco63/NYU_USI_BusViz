
$(document).ready(function() {
  //calendar
  $('.input-group.date').datepicker({
  });
});

function initialize() {
  var mapOptions = {
    center: { lat: 40.725497, lng: -73.974016},
    zoom: 14,
    disableDefaultUI: true,
    styles :[{"stylers":[{"hue":"#ff1a00"},{"invert_lightness":true},{"saturation":-100},{"lightness":33},{"gamma":0.5}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#2D333C"}]}]
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);



