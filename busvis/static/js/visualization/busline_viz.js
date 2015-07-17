$(".subway-map").subwayMap({ debug: false });

$.extend({
    el: function(el, props) {
        var $el = $(document.createElement(el));
        $el.attr(props);
        return $el;
    }
});


function drawLineViz(route_id){
		$(".subway-map").subwayMap({ debug: true });

$(".subway-map").append(

	        $.el('ul', {'data-color': '#ff4db2'}, {'data-label':'jQuery Widgets'})
		        .append(
		            $.el('li', {'data-coords':'2,2'}).text('A')
		        )
		        .append(
		            $.el('li', {'data-coords':'4,2'}).text('B')
		        )
		)

}