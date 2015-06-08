$('#datepicker').datepicker({
  });

$("#searchBus").typeahead({source:bus_stops_name});

/*
$("#searchBus").keyup(function(event){
	if(event.keyCode == 13){
		$("#searchBusButton").click();
	}
});
*/

/*
$("#searchBusButton").click(function(){
	var stop_name = document.getElementById("searchBus").value;
	var stop_id_idx = bus_stops_name.indexOf(stop_name);
	
	var stop_id = bus_stops_id[stop_id_idx]; 
	var start_date = document.getElementById("startDate").value;
	var end_date = document.getElementById("endDate").value;


	
	/*TO DO : Integrate submit function with flask
	Output Param : stop_id, start_date, end_date*/
	/*
});
*/
