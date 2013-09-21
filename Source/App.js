var viewer = new Cesium.Viewer('cesiumContainer', {
	animation : false,
	timeline : false,
    selectedImageryProviderViewModel : new Cesium.ImageryProviderViewModel(
    {
        name : 'Open\u00adStreet\u00adMap',
        iconUrl : Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
        tooltip : 'OpenStreetMap (OSM) is a collaborative project to create a free editable map \
of the world.\nhttp://www.openstreetmap.org',
        creationFunction : function() {
            return new Cesium.OpenStreetMapImageryProvider({
                url : 'http://tile.openstreetmap.org/'
            });
        }
    })
});

///////////////////////////////////////////////////////////////////////////////
//////////// Example code from Matt

	//Adds default balloon and tracking support (left click/right click)
	viewer.extend(Cesium.viewerDynamicObjectMixin);

	var busCollection = new Cesium.DynamicObjectCollection();
	var busVisualizers = new Cesium.DynamicBillboardVisualizer(viewer.scene, busCollection);

	//Load a data source GeoJsonDataSource, KmlDataSource, CzmlDataSource
	var geoJsonDataSource = new Cesium.GeoJsonDataSource();

	//If you want to style the GeoJsonDataSource, you can do it before loading a file
	var billboard = new Cesium.DynamicBillboard();

	//Use a billboard instead of a point
	geoJsonDataSource.defaultPoint.point = undefined;
	geoJsonDataSource.defaultPoint.billboard = billboard;
	billboard.show = new Cesium.ConstantProperty(true);
	billboard.image = new Cesium.ConstantProperty('http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png');
	billboard.width = new Cesium.ConstantProperty(32);
	billboard.height = new Cesium.ConstantProperty(32);
	billboard.verticalOrigin = new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM);

	//Make polygon solid plue
	geoJsonDataSource.defaultPolygon.polygon.material.color = new Cesium.ConstantProperty(Cesium.Color.clone(Cesium.Color.BLUE));
	//Make polyline solid plue
	geoJsonDataSource.defaultLine.polyline.color = new Cesium.ConstantProperty(Cesium.Color.clone(Cesium.Color.RED));

	//Actually load the data source
	geoJsonDataSource.loadUrl('Assets/example.geojson');

	//Add it to viewer.
	viewer.dataSources.add(geoJsonDataSource);

	//If using the data source layer, you can programmatically bring up the balloon browser by assigning a dynamic object to
	//viewer.balloonedObject = dynamicObject

//////////// End example code from Matt
///////////////////////////////////////////////////////////////////////////////

var scene = viewer.scene;

var lastFrame = new Date().getTime();
var accumulatedMs = 0;
function animate(elapsedMs) {
    accumulatedMs += elapsedMs;
    if (accumulatedMs > 1000) {
        accumulatedMs -= 1000;
        loadSeptaRoutes(viewer, busCollection);
    }
}

(function tick() {
    var now = new Date().getTime();
    var elapsedMs = now - lastFrame;
    scene.initializeFrame();
    animate(elapsedMs);
    busVisualizers.update(viewer.clock.currentTime);
    scene.render();
    Cesium.requestAnimationFrame(tick);
    lastFrame = now;
})();

var balloonContainer = document.createElement('div');
balloonContainer.className = 'pedestrian-balloonContainer';
viewer.container.appendChild(balloonContainer);
var balloon = new Cesium.Balloon(balloonContainer, scene);

var handler = new Cesium.ScreenSpaceEventHandler(scene.getCanvas());
handler.setInputAction(
    function (movement) {
        var pick = scene.pick(movement.endPosition);
        if (Cesium.defined(pick) && Cesium.defined(pick.id) && pick.id.showBalloon) {
        	console.log(pick.id.html);
// TODO: show balloons
/*
			var balloonViewModel = balloon.viewModel;
			balloonViewModel.position = movement.endPosition;
			balloonViewModel.content = pick.id.html;
			balloonViewModel.showBalloon = true;
			balloonViewModel.update();
 */
        }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE
);

Cesium.loadJson('Assets/PedestrianCounts/PedCount082013.json').then(createPedestrianCount(viewer), 
    function() {
        // TODO: an error occurred
});

scene.getAnimations().add(Cesium.CameraFlightPath.createAnimationCartographic(scene, {
    destination : Cesium.Cartographic.fromDegrees(-75.163616, 39.952382, 1500.0),
    duration : 2000
}));

// TODO: destroy balloon and primitives