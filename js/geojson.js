define(function () {
    "use strict";
    var GeoJson = function (layerManager) {
        this.layerManager = layerManager;
        var layers = [];
        this.layers = layers;
        this.polygonLayer = new WorldWind.RenderableLayer("3DPolygon");
        this.polygonLayer.hide = true;
        this.polygonLayer.enabled = true;
        wwd.addLayer(this.polygonLayer);
    };

    GeoJson.prototype.add3d = function (bbox, color, zoomFunction) {
        var self = this;

        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};
            configuration.extrude = true;

            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.drawInterior = false;
                configuration.drawOutline = false;
                configuration.attributes.drawVerticals = false;
                configuration.attributes.extrude = true;
                if (properties && properties.Z_Mean) {
                    properties.altitude = (properties.Z_Mean + 1);
                }
                configuration.attributes.applyLighting = true;
                configuration.attributes.enableLighting = true;
                configuration.attributes.properties = properties;

                configuration.attributes.interiorColor = new WorldWind.Color(
                    color.red,
                    color.green,
                    color.blue,
                    1);
                configuration.attributes.outlineColor = new WorldWind.Color(
                    color.red,
                    color.green,
                    color.blue,
                    1);
                configuration.attributes.drawOutline = true;

            }

            return configuration;
        };


        var completed = function (res) {
            res.crs.properties.name = "urn:ogc:def:crs:OGC:1.3:CRS84";
            res = JSON.stringify(res);
            var polygonGeoJSON = new WorldWind.GeoJSONParser(res);
            polygonGeoJSON.load(zoomFunction, shapeConfigurationCallback, self.polygonLayer);
        };

        this.polygonLayer.removeAllRenderables();
        $.ajax({
            type: "get",
            url: 'http://131.175.59.195/geoserver/wfs?srsName=EPSG%3A4326&typename=geonode%3Ahel_buildings&outputFormat=json&version=1.0.0&service=WFS&request=GetFeature&bbox=' + bbox,
            success: completed
        });


    };
    GeoJson.prototype.add = function (name, label, active, callbackFunction) {
        var self = this;
        var resourcesUrl = "geojson/";

        if (label == "Neighborhoods") {
            var polygonLayer = new WorldWind.RenderableLayer(label);
        } else {
            var polygonLayer = new WorldWind.RenderableLayer(label + " ");
        }
        var polygonGeoJSON = new WorldWind.GeoJSONParser(resourcesUrl + name + ".geojson");

        var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageScale = 0.8;
        placemarkAttributes.imageSource = "icons/castshadow-teal.png";//'icons/' + name + '.png';


        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPointType() || geometry.isMultiPointType()) {
                configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);

            }
            else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.drawOutline = true;
                configuration.attributes.outlineWidth = 0.50;
            }
            else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.45;
                configuration.attributes.interiorColor = new WorldWind.Color(0, 0, 0, 0);

                configuration.attributes.outlineColor = new WorldWind.Color(0, 0, 0, 0.8);
            }

            return configuration;
        };
        try {

            var callback = function () {
                self.eyeDistance.call(self, polygonLayer);
                if (callbackFunction && typeof (callbackFunction) == "function") {
                    callbackFunction();
                }
            }
            try {
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
                active ? true : false;
                polygonLayer.enabled = active;
            } catch (e) {
                console.log("No vector available" + e);
            }

        } catch (e) {
            console.log("No vector available" + e);
        }

    };

    GeoJson.prototype.helsinki = function (callback) {

        var self = this;
        $.ajax({
            url: "geojson/milano_grid.json",
            success: function (res) {
                self.JSONgrid = JSON.stringify(res);
                var polygonGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(res));
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            }
        });

        var polygonLayer = new WorldWind.RenderableLayer("My3D Helsinki");


        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};


            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.interiorColor = new WorldWind.Color(
                0, 0, 0, 0);
            configuration.attributes.drawOutline = false;
            configuration.attributes.properties=properties;

            return configuration;
        };
        polygonLayer.enabled = false;
        polygonLayer.pickEnabled = true;
        polygonLayer.opacity = 0.5;
        polygonLayer.raster = true;
        this.grid = polygonLayer;
        wwd.addLayer(polygonLayer);
        this.layerManager.synchronizeLayerList();

    };

    GeoJson.prototype.getColor = function (weight, inputColors) {
        var p, colors = [];
        if (weight < 50) {
            colors[1] = inputColors[0];
            colors[0] = inputColors[1];
            p = weight / 50;
        } else {
            colors[1] = inputColors[1];
            colors[0] = inputColors[2];
            p = (weight - 50) / 50;
        }
        var w = p * 2 - 1;
        var w1 = (w / 1 + 1) / 2;
        var w2 = 1 - w1;
        var rgb = [Math.round(colors[0][0] * w1 + colors[1][0] * w2),
            Math.round(colors[0][1] * w1 + colors[1][1] * w2),
            Math.round(colors[0][2] * w1 + colors[1][2] * w2)
        ];
        return [rgb[0], rgb[1], rgb[2], 255];
    };


    GeoJson.prototype.eyeDistance = function (layer) {
        if (layer.renderables) {
            wwd.addLayer(layer);
            if (layer.displayName !== "Neighborhoods") {
                this.layers.push(layer);
            }
            for (var x in layer.renderables) {
                var o = layer.renderables[x];
                o.eyeDistanceScaling = true;
                o.eyeDistanceScalingThreshold = 10000;
            }
            this.layerManager.synchronizeLayerList();
        }
    };

    GeoJson.prototype.clean = function () {
        var length = this.layers.length;
        for (var x = 0; x <= length; x++) {
            wwd.removeLayer(this.layers[x]);
        }
        this.layers = [];

    };
    return GeoJson;
})
;