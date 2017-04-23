$(function () {
    $("#header").load("header.html");
    $("#footer").load("footer.html");
});
var application;
var geo;
require(['js/worldwind', 'js/UserInterface', 'js/geojson'],
    function (worldwind, UserInterface, GeoJson) {
        geo=this;
        if (application) {

            worldwind = new worldwind();
            this.geojson = new GeoJson(worldwind.layerManager);
            var UserInterface = new UserInterface(worldwind.layerManager, this.geojson);
            UserInterface.listeners();
            setTimeout(function(){
                geojson.helsinki.call(geojson);
            },300);
        }
    });


