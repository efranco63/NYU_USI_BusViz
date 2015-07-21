// =====================================================
// Filename : busline_viz.js
// Author : Kania Azrina
// Desc : Create bus line visualization per bus route 
// =====================================================



function drawLineViz(stop_list,speed_list,dist_list){

    //get panel's width
    var panelWidth = $("body").width()*0.4;
    console.log(panelWidth)
    var cellSize = 15;
    var maxCellRow = 1000;
    var cellColumn = Math.floor(panelWidth/cellSize);

    var nSegment = speed_list.length;
    var offset = 2;
    var x = Math.floor(cellColumn/2);
    var coordsHolder = "";

    //initialize canvas
    $( "#subway_viz" ).empty();

    var viz_div = document.createElement('div');
    viz_div.id = "subway_viz";
    viz_div.setAttribute("data-columns",cellColumn);
    viz_div.setAttribute("data-rows",maxCellRow);
    viz_div.setAttribute("data-cellSize",cellSize);
    viz_div.setAttribute("data-legendId","legend");
    viz_div.setAttribute("data-textClass","stopLabel");
    viz_div.setAttribute("data-gridnumbers","true");
    viz_div.setAttribute("data-grid","false");
    viz_div.setAttribute("data-lineWidth","8");

    $(".subway-map").append(viz_div);


    //segment iteration
    for (var i=0 ; i<(nSegment) ; i++){
        
        var viz_ul= document.createElement('ul');

        viz_ul.id = "subway_viz_ul";

        if (speed_list[i] != "null"){
            viz_ul.setAttribute("data-color",colorScale(speed_list[i]));
        } else {
            viz_ul.setAttribute("data-color",colorScale("#d3d3d3"));
        }
        
        $("#subway_viz").append(viz_ul);

        coordsHolder = x.toString()+","+offset.toString();

        var viz_il_1 = document.createElement('li');
        viz_il_1.setAttribute("data-coords",coordsHolder);
        viz_il_1.setAttribute("data-labelPos","E");
        viz_il_1.appendChild(document.createTextNode(bus_stop_dict[stop_list[i]]));

        offset = offset + speed_list[i];
        coordsHolder = x.toString()+","+offset.toString();
    
        var viz_il_2 = document.createElement('li');
        viz_il_2.setAttribute("data-coords",coordsHolder );
        viz_il_2.setAttribute("data-labelPos","NW");
        viz_il_2.appendChild(document.createTextNode((speed_list[i]).toFixed(2).toString()+" mph"));

        $(viz_ul).append(viz_il_1);
        $(viz_ul).append(viz_il_2);

    }

    //last stop
    var viz_ul= document.createElement('ul');
    viz_ul.id = "subway_viz_ul";
    viz_ul.setAttribute("data-color",colorScale(speed_list[nSegment]));

    $("#subway_viz").append(viz_ul);

    coordsHolder = x.toString()+","+offset.toString();

    var viz_il = document.createElement('li');
    viz_il.setAttribute("data-coords",coordsHolder);
    viz_il.setAttribute("data-labelPos","E");
    viz_il.appendChild(document.createTextNode(bus_stop_dict[stop_list[nSegment]]));

    $(viz_ul).append(viz_il);

    $("#subway_viz").subwayMap({ debug: false });
};
