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
	var kmlDataSource = new Cesium.KmlDataSource();
	kmlDataSource.loadUrl('Assets/17.kml');

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
	viewer.dataSources.add(kmlDataSource);

	//If using the data source layer, you can programmatically bring up the balloon browser by assigning a dynamic object to
	//viewer.balloonedObject = dynamicObject

//////////// End example code from Matt
///////////////////////////////////////////////////////////////////////////////

var scene = viewer.scene;

///////////////////////////////////////////////////////////////////////////////
// Render loop

var lastFrame = new Date().getTime();
var accumulatedMs = 0;
var tickRate = 30000;
function animate(elapsedMs) {
    accumulatedMs += elapsedMs;
    if (accumulatedMs > tickRate) {
        accumulatedMs -= tickRate;
        refreshRoute(viewer, busCollection);
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

///////////////////////////////////////////////////////////////////////////////
// User interaction

var balloonContainer = document.createElement('div');
balloonContainer.className = 'cesium-viewer-balloonContainer';
viewer.container.appendChild(balloonContainer);
var balloon = new Cesium.Balloon(balloonContainer, scene);
balloon.viewModel.computeScreenSpacePosition = function(value, result) {
	result.x = value.x;
	result.y = viewer.container.clientHeight - value.y;
	return result;
};

var pedestrianJson;
var pedestrianPrimitives;
var pick;
var endPosition;
var fadedInGeometry;

var handler = new Cesium.ScreenSpaceEventHandler(scene.getCanvas());
handler.setInputAction(
    function (movement) {
    	endPosition = movement.endPosition;
        pick = scene.pick(movement.endPosition);
        if (Cesium.defined(pick) && Cesium.defined(pick.id)) {
        	
        	var primitive = pick.primitive;
        	var id = pick.id;
        	
        	if (!id.__fadedIn) {
	        	id.__fadedIn = true;
	        	
	        	if (Cesium.defined(fadedInGeometry)) {
	        		var outPrimitive = fadedInGeometry.primitive;
	        		var outId = fadedInGeometry.id;
	        		
		            scene.getAnimations().add({
		            	startValue : { alpha : 1.0 },
		            	stopValue : { alpha : 0.5 } ,
			            duration : 200,
	                    easingFunction : Cesium.Tween.Easing.Cubic.In,
			            onUpdate : function(value) {
			            	// Not optimized at all.
			            	var attributes = outPrimitive.getGeometryInstanceAttributes(outId);
			            	attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], value.alpha * 255.0];
			            },
			            onComplete : function() {
			            	outId.__fadedIn = false;
			            }
		            });
	        	}
	        	
	        	fadedInGeometry = {
        			primitive : primitive,
        			id : id
	        	};
	        	
	            scene.getAnimations().add({
	            	startValue : { alpha : 0.5 },
	            	stopValue : { alpha : 1.0 } ,
		            duration : 200,
                    easingFunction : Cesium.Tween.Easing.Cubic.In,
		            onUpdate : function(value) {
		            	// Not optimized at all.
		            	var attributes = primitive.getGeometryInstanceAttributes(id);
		            	attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], value.alpha * 255.0];
		            },
		            onComplete : function() {
		            }
	            });
        	}
        }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE
);
// Double click to show balloon
handler.setInputAction(
    function () {
        if (Cesium.defined(pick) && Cesium.defined(pick.id) && pick.id.showBalloon) {
			var balloonViewModel = balloon.viewModel;
			balloonViewModel.position = endPosition;
			balloonViewModel.content = pick.id.html;
			balloonViewModel.showBalloon = true;
			balloonViewModel.update();
        }
    },
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
);
// Single click to show/hide plane
handler.setInputAction(
    function () {
		var balloonViewModel = balloon.viewModel;
		balloonViewModel.showBalloon = false;
		balloonViewModel.update();

        if (Cesium.defined(pick) && Cesium.defined(pick.id) && Cesium.defined(pick.id.animateExtentSlice)) {
            pick.id.animateExtentSlice(pick.id);
        } else if (Cesium.defined(pick) && Cesium.defined(pick.primitive) && pick.primitive.__hideOnPick) {
            var primitive = pick.primitive;
            scene.getAnimations().addAlpha(pick.primitive.material, pick.primitive.material.uniforms.color.alpha, 0.0, {
                onComplete : function() {
                    primitive.show = false;
                },
                duration : 600,
                easingFunction : Cesium.Tween.Easing.Cubic.In
            });
        }
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK
);


var debugButtonA = document.getElementById('debugButtonA');
debugButtonA.onclick = function() {
    // do something...
	debugger;
};
var debugButtonB = document.getElementById('debugButtonB');
debugButtonB.onclick = function() {
    // do something...
	debugger;
};

///////////////////////////////////////////////////////////////////////////////
// Initialize

var year = 'August 2013';
//var year = 'August 2012';

var category = 'Daily Average';
//var category = 'By Time of Day';
//var category = 'By Day of Week';
//var category = 'Weekly Average';

function recreatePedestrianCount() {
	var properties;
	
	if (category ==='Daily Average') {
		properties = ['Average Weekday Pedestrian Activity', 'Average Weekend Pedestrian Activity'];
	} else if (category ==='By Time of Day') {
		properties = ['Early Morning', 'Morning RH ', 'Late Morning', 'Lunch', 'Late Afternoon', 'Evening RH', 'Evening', 'Late Night'];
	} else if (category ==='By Day of Week') {
		properties = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	} else if (category ==='Weekly Average') {
		properties = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
	}	
	
	pick = undefined;
	fadedInGeometry = undefined;
	if (Cesium.defined(pedestrianPrimitives)) {
		// TODO: if current animations are executing referencing these, it won't be good.
		viewer.scene.getPrimitives().remove(pedestrianPrimitives);
		pedestrianPrimitives.destroy();
		pedestrianPrimitives = undefined;
	}
	pedestrianPrimitives = createPedestrianCount(viewer, pedestrianJson, year, properties);
}

var pedestrianButton = document.getElementById('pedestrian-button');
pedestrianButton.onclick = function() {
	Cesium.loadJson('Assets/PedestrianCounts/PedCount082013.json').then(
		function(json) {
			pedestrianJson = json;
			recreatePedestrianCount();
		},
        function() {});
};

var busButton = document.getElementById('bus-button');
busButton.onclick = function() {
	Cesium.loadJson('Assets/google_bus/routes.json').then(createSeptaBusRoutes(viewer, busCollection),
	    function() {
	        // TODO: an error occurred
	});
};

scene.getAnimations().add(Cesium.CameraFlightPath.createAnimationCartographic(scene, {
    destination : Cesium.Cartographic.fromDegrees(-75.163616, 39.952382, 1500.0),
    duration : 2000
}));



// TODO: destroy balloon and primitives
