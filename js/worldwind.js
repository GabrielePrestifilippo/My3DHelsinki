var wwd;
var nav;
var accelerateRender=false;
var layerManager;
define(['./LayerManager'],
    function (LayerManager) {

        var worldwind = function (results) {
            this.results = results;
            wwd = new WorldWind.WorldWindow("canvasOne");

            var layers = [

                {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
                {
                    layer: new WorldWind.DigitalGlobeTiledImageLayer("Light map", "mapbox.light", 'pk.eyJ1IjoiZ2Ficnk1MDEiLCJhIjoiY2l2dGdtcjAzMDAzbjJvcWRmN3E4d3k4MCJ9.ghyEXEojEXRXklFc4DWtDA'),
                    enabled: false
                },
                {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
            ];
            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }

            wwd.layers[0].detailControl=0.8;
            wwd.layers[1].detailControl=0.5;
            wwd.layers[2].hide=true;
            // Create a layer manager for controlling layer visibility.
            this.layerManager = new LayerManager(wwd);
            layerManager = this.layerManager;

            wwd.navigator.lookAtLocation.latitude = 60.162059;
            wwd.navigator.lookAtLocation.longitude = 24.945831;
            wwd.navigator.range = 5500;

            //this.layerManager.flat();



        };

        return worldwind;

    });

