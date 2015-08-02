!function() {
    function addSlippyVectorLayer(canvas, options)
    {
        var prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
        var obj = {
            options : {
                minZoom: 15,
                maxZoom: 18,
                minNativeZoom: 15,
                maxNativeZoom: 15,
                tileStache: false,
                bounds: canvas.options.bounds,
            },
            lut: d3.scale.threshold().domain([3.8, 5.4, 7.4, 11.5]).range(colorbrewer.RdYlGn[5]),
            canvasSize : canvas.map.getSize(),
            map: canvas.map,
            halfCanvasSize : canvas.map.getSize().multiplyBy(0.5),
            tilePath : d3.geo.path().projection(d3.geo.mercator()),
            layer : d3
                .select(canvas.map.getPanes().overlayPane)
                .append("div")
                .attr("class", "layer"),
            projection: null,
            zoom: null,
            tile: null,
            tileScale: null,
            realLevel: null,
            
            _viewReset: function () {
                var leafLevel = this.map.getZoom();
                if (leafLevel<this.options.minZoom || leafLevel>this.options.maxZoom) {
                    this.realLevel = -1;
                    this._clearTiles();
                    return;
                }
                this.realLevel = Math.max(Math.min(leafLevel, this.options.maxNativeZoom), this.options.minNativeZoom);
                this.tileScale = Math.pow(2, leafLevel-this.realLevel);
                var width = this.canvasSize.x/this.tileScale,
                    height = this.canvasSize.y/this.tileScale;
                this.tile = d3.geo.tile().size([width, height]);
                var levelScale = Math.pow(2, this.realLevel+8); 
                this.projection = d3.geo.mercator()
                    .scale(levelScale / 2 / Math.PI)
                    .translate([-width/2, -height/2]);
                this.zoom = d3.behavior.zoom()
                    .scale(levelScale)
                    .scaleExtent([1 << (this.options.minZoom+8), 1 << (this.options.maxZoom+8)]);
                this._canvasMoved();
            },

            _clearTiles: function () {
                this.layer
                    .selectAll(".tile")
                    .each(function(d) { if (this._xhr) this._xhr.abort(); })
                        .remove();
            },

            _canvasMoved: function () {
                if (this.realLevel<0) return;
                var center = this.map.getCenter();
                z = this.zoom.translate(this.projection([center.lng, center.lat]).map(function(x) { return -x; }));
                var tiles = this.tile
                    .scale(z.scale())
                    .translate(z.translate())
                ();
                var offset = this.map.latLngToLayerPoint(center).subtract(this.halfCanvasSize).divideBy(tiles.scale*this.tileScale);
                var translation = [tiles.translate[0]+offset.x, tiles.translate[1]+offset.y];
                var image = this.layer
                    .style(prefix + "transform", matrix3d(tiles.scale*this.tileScale, translation))
                    .selectAll(".tile")
                    .data(tiles, function(d) { return d; });

                image.exit()
                    .each(function(d) { if (this._xhr) this._xhr.abort(); })
                        .remove();

                var self = this;
                image.enter().append("svg")
                    .attr("class", "tile")
                    .style("left", function(d) { return d[0] * 256 + "px"; })
                    .style("top", function(d) { return d[1] * 256 + "px"; })
                    .each(function (d) {
                        var tl = L.point(d[0]*256, d[1]*256);
                        var tileBounds = L.latLngBounds([self.map.unproject(tl, self.realLevel),
                                                         self.map.unproject(L.point(tl.x+256, tl.y+256), self.realLevel)]);
                        if (tileBounds.intersects(self.options.bounds)) {
                            var svg = d3.select(this);
                            var tileUrl = self._extendTileUrl(d);
                            this._xhr = d3.json(tileUrl, function(error, json) {
                                var k = Math.pow(2, d[2]+8-1);
                                self.tilePath.projection()
                                    .translate([k - tl.x, k - tl.y])
                                    .scale(k / Math.PI);
                                svg.selectAll("path")
                                    .data(json.features)
                                    .enter().append("path")
                                    .attr("class", "speed")
                                    .attr("d", self.tilePath)
                                    .style("stroke", function(d) { return self.lut(d.properties.speed); })
                                    .style("stroke-width", function() { return 2.0/self.tileScale; })
				                    .on("mouseenter", function() { self.map._container.style.cursor = 'pointer';})
				                    .on("mouseleave", function() { self.map._container.style.cursor = ''; })
                                    .on("click", function(d) { self._showInfo(self, d); });
                            });
                        }
                    });
            },
            
            _showInfo: function (self, d) {
                self.map.openPopup("Speed: " + d.properties.speed + '<br />' + 'Shape: ' + d.properties.shape_id,
                                   self.map.containerPointToLatLng(d3.mouse(self.map._container)));
            },
            
            _extendTileUrl: function (d) {
                var X = d[0];
                var Y = d[1];
                if (this.options.tileStache) {
                    X = this._tileStacheFormat(X);
                    Y = this._tileStacheFormat(Y);
                }
                return L.Util.template(this.options.url, L.extend({z:d[2], x:X, y: Y, s: (["a", "b", "c"][(d[0] * 31 + d[1]) % 3])}));
            },

            _tileStacheFormat: function (t) {
                var s = "000000" + t;
                return s.substr(s.length-6, 3) + "/" + s.substr(s.length-3);
            },
        };
        L.Util.setOptions(obj, options);

        obj.map.on("zoomstart", function() { obj._clearTiles(); });
        obj.map.on("moveend", function() { obj._canvasMoved(); });
        obj.map.on("viewreset", function() { obj._viewReset(); });
        obj._viewReset();
        
        function matrix3d(scale, translate) {
            var k = scale / 256, r = scale % 1 ? Number : Math.round;
            return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
        }

        function prefixMatch(p) {
            var i = -1, n = p.length, s = document.body.style;
            while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
            return "";
        }

        return obj;
    }
    
    busvis.addSlippyVectorLayer = addSlippyVectorLayer;
}();
