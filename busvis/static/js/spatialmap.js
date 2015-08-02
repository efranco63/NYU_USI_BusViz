!function() {
    function initSpatialMap(canvasId, options)
    {
        var maps = [['https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png',
                     {id: 'examples.map-20v6611k',
                      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                      'Imagery <a href="http://mapbox.com">Mapbox</a>'}],
                    ['https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
                     {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                      '&copy; <a href="http://cartodb.com/attributions">CartoDB</a> base maps, ' +
                      '&copy; <a href="http://cusp.nyu.edu">NYU CUSP BusVis</a> analysis'}],
                    ['http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                     {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                      '&copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}]];
        var mapId = 1;

        var canvas = {
            options : {
                center: [40.7127, -74.0059],
                zoom  : 13,
                bounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
                layers: [L.tileLayer(maps[mapId][0], maps[mapId][1])],
                closePopupOnClick : false,
            },
            map: null,
        };
        L.Util.setOptions(canvas, options);
        canvas.map = L.map(canvasId, canvas.options);
        return canvas;
    }
    busvis.initSpatialMap = initSpatialMap;
}();
